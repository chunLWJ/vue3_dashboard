import {
    getAlarm, getCountResMonitorCycles,
    getHistory,
    getLines,
    getPing, getResMonitorCycles,
    getResourceStatistics,
    getResourceStatisticsType,
    getTrafficLoad, getUsages
} from "@/network/request";
import dayjs from "dayjs";
import {getLineValue} from "@/utils/map";

export async function initDashboard() {
    const centerLinesMap = new Map() // 中心节点 Map
    const defaultLinesMap = new Map() // 默认节点 Map


    const lineTrafficEndpointMap = new Map() // 负载告警 绑定 线路 id
    const linePingEndpointMap = new Map() // ping 告警 绑定 线路 id
    const lineStatusEndpointMap = new Map() // 状态 告警 绑定 线路 id
    let endpointCounters = [] // 中心节点的 进出 流量

    // 一小时的告警
    let _alerts = [] // 告警列表
    let abnormalMap = new Map()

    let quality = [0, 0, 0, 0]


    // 中心节点数据数组 暂时不考虑多个中心节点。
    // let lineInValues = []
    // let lineOutValues = []
    let centerId = ''
    // 数组的最后一个值，即最近的进出流量。
    let lineLastIn = 0
    let lineLastOut = 0;

    let infos = {} // 资源统计
    const circlesData = [ // 利用率
        {
            name: 'cpu',
            value: 0,
        },
        {
            name: '内存',
            value: 0,
        },
        {
            name: '磁盘',
            value: 0
        }
    ]
    let alertTrend = [] // 告警趋势

    // 获取 进出流量，ping
    await Promise.all([
        getLines(),
        getAlarm(),
        getTrafficLoad(),
        getTrafficLoad(undefined, {metric: 'traffic.out'}),
        getPing(),
        getPing(undefined, {metric: 'ping.avgDelay'}),

        getResourceStatistics(),
        // getResourceStatisticsType(),
        // getResourceStatisticsType(undefined, {type: 5}),
        // getResourceStatisticsType(undefined, {type: 6}),
        getUsages(),
        getCountResMonitorCycles(),
        getResMonitorCycles(),
    ]).then(async ([
                       {data: lines = []},
                       {data: alerts = []},
                       {data: {list: trafficInList = []}},
                       {data: {list: trafficOutList = []}},
                       {data: {list: pingLossList = [], avgLoss = 0, maxLoss = 0}},
                       {data: {list: pingAvgDelayList = [], avgDelay = 0, maxDelay = 0}},
                       {data: _infos = {}}, // 资源统计
                       // {data: cpus = []}, // cpu
                       // {data: rams = []}, // 内存
                       // {data: disks = []}, // 磁盘
                        {data : circles = {}},
                                        {data: {allAlarmList = [],newAlarmList = []}}, // 告警趋势
                       {list: prevAlerts = []}
                   ]) => {
        infos = _infos
        // circlesData[0].value = getTotalScale(cpus);
        // circlesData[1].value = getTotalScale(rams);
        // circlesData[2].value = getTotalScale(disks);
        circlesData[0].value = Math.round(circles.cpu)
        circlesData[1].value = Math.round(circles.memory)
        circlesData[2].value = Math.round(circles.disk)

        alertTrend = [allAlarmList,newAlarmList]

        /**
         * 获取 总规模 下的值
         * @param list {Array}
         * @return {number}
         */
        function getTotalScale(list) {
            let value = 0
            list.every((item) => {
                console.log('item', item.name === '总规模')
                if (item.name == '总规模') {
                    value = parseInt(item.evaAvg)
                }
                return item.name !== '总规模'
            })
            return value
        }

        lines.forEach(item => {

            const trafficEndpoint = JSON.parse(item.trafficEndpoint || '[]')
            const pingEndpoint = JSON.parse(item.pingEndpoint || '[]')
            const statusEndpoint = JSON.parse(item.statusEndpoint || '[]')

            // 这里进行绑定
            if (trafficEndpoint.length > 0) {
                lineTrafficEndpointMap.set(trafficEndpoint[0].endpoint, item.id)
            }
            if (pingEndpoint.length > 0) {
                linePingEndpointMap.set(pingEndpoint[0].endpoint, item.id)
            }
            if (statusEndpoint.length > 0) {
                lineStatusEndpointMap.set(statusEndpoint[0].endpoint, item.id)
            }

            // 线路映射成map
            ;(item.lineType === 1 ? centerLinesMap : defaultLinesMap).set(
                item.id,
                {
                    ...item,
                    coordinate: item.coordinate ? item.coordinate.split(',').reverse().map(item => parseFloat(item)) : [0, 0]
                }
            )
            if (item.lineType === 1) {
                centerId = item.id // 中心节点，总是取最后一个
                // 这里流量表只需要 负载的 即可，
                console.log('item',item,trafficEndpoint)
                if (trafficEndpoint.length > 0) {
                    endpointCounters.push(...trafficEndpoint) // 只需要中心节点的负载，总是取最后一个负载
                }
            }
        })

        /**
         * @param list {Array<{value: {value: {Number}}}>} 循环的数组
         * @param field {String} 取值的字段名
         * @param other {Array<{key: {String},value: {String}}>} 其他字段
         */
        function defaultLineValue(list, field, other = []) {
            list.forEach(item => {
                if (defaultLinesMap.has(item.id) || centerLinesMap.has(item.id)) {
                    const line = defaultLinesMap.get(item.id)|| centerLinesMap.get(item.id)
                    line[field] = item.value ? item.value.value : 0
                    other.forEach(o => line[o.key] = item[o.value])
                }
            })
        }

        defaultLineValue(trafficInList, 'trafficIn', [{key: 'trafficInLoad', value: 'load'}])
        defaultLineValue(trafficOutList, 'trafficOut', [{key: 'trafficOutLoad', value: 'load'}])
        defaultLineValue(pingLossList, 'pingLoss')
        defaultLineValue(pingAvgDelayList, 'pingAvgDelay')

        quality = [avgLoss || 0, avgDelay || 0, maxLoss || 0, maxDelay || 0]


        // 这里的 endpointCounters 只取 中心节点 的 最后一个 endpoint
        const historys = await getHistory(undefined, undefined, {
            cf: "AVERAGE",
            end: Math.floor(dayjs().valueOf() / 1000),
            endpoint_counters: endpointCounters,
            start: Math.floor(dayjs().subtract(1, 'day').valueOf() / 1000)
        });


        historys.forEach && historys.forEach((history, index) => {
            // 这里只读取 非中心节点 的数据
            if (lineTrafficEndpointMap.has(history.endpoint)) {
                // 中心节点 绑定的线路数据
                const line = centerLinesMap.get(lineTrafficEndpointMap.get(history.endpoint))
                line[history.counter] = history.Values
            }
        })

        // 中心节点的 in 和 out 的值，取最新线路
        if (centerLinesMap.has(centerId)) {
            const lineLast = centerLinesMap.get(centerId)
            let lineInValues = lineLast['traffic.in'] || []
            let lineOutValues = lineLast['traffic.out'] || []
            lineLastIn = lastEffectiveValue(lineInValues)
            lineLastOut = lastEffectiveValue(lineOutValues)
        }

        /**
         * 取最后一个有效值，最新值可能为 undefined，总是向上遍历
         * @param values {Array}
         * @return {number}
         */
        function lastEffectiveValue(values) {
            let len = values.length;
            if (len === 0) return 0;
            let value;
            do {
                value = values[len - 1].value
                len--;
            } while (typeof value !== "number")
            return value || 0

        }

        // 告警，这个告警是拿来计算出 故障的 个数。
        alerts.forEach(item => {
            let resMonitorItemId = (item.resMonitorItemId || '').toString()

            let name = '';
            [lineTrafficEndpointMap, linePingEndpointMap, lineStatusEndpointMap].forEach(endpointMap => {
                if (endpointMap.has(resMonitorItemId)) { // 存在 告警
                    let lineId = endpointMap.get(resMonitorItemId) // 确定绑定的线路
                    if (defaultLinesMap.has(lineId) || centerLinesMap.has(lineId)) {
                        const line = defaultLinesMap.get(lineId) || centerLinesMap.get(lineId)
                        line.alert = true // 设置 告警 为 true
                        name = line.name
                    }
                }
            })
        })

        // 以前的告警列表
        _alerts = prevAlerts.map(item => ({
            level: `P${item.level}`,
            resources: `${item.resMonitorName}`,
            time: `${dayjs(item.updateTime).diff(item.createTime, "minute")} 分前`,
            content: `${item.opContent}`,
        }))
        // 计算告警个数
        ;[...defaultLinesMap.values(),...centerLinesMap.values()].forEach(item => {
            const _value = getLineValue(item) // 取 map 哪里的计算颜色，10 是 正常，非 10 都算异常
            if (_value !== 10)
                abnormalMap.set(item.id,item)
        });
    })
    return {
        sum: defaultLinesMap.size + centerLinesMap.size, // 专线总数
        abnormal: abnormalMap.size, // 异常总数
        // 正常总数，用 总-异常 即可
        abnormalMap,

        // 最新线路 in out
        // lineInValues,
        // lineOutValues,
        // lineValuesName,
        lineLastIn, // 最新线路的最后一个 in 和 out 值
        lineLastOut,
        centerId, // 最新线路的id
        centerLinesMap, // 中心节点
        defaultLinesMap,  // 默认节点

        alerts: _alerts, // 告警列表

        alertTrend, // 告警趋势

        quality, // 质量

        infos, // 资源统计
        circlesData, // 使用率
    }
}
