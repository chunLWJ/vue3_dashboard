import request from './serve'

// 获取所有线路
export const getLines = (method = 'GET', params, data) =>
    request({
        url: '/v1/resDashboardLines.do',
        method,
        params,
        data
    })

// 获取所有告警信息
export const getAlarm = (method = 'GET',params = {time: 60,isNotice:1},data) =>
    request({
        url: '/v1/resDashboardLine/getAlarm.do',
        method,
        params,
        data
    })

// 实时告警，原 实时告警接口
export const getResMonitorCycles = (method = 'GET',params = {time: 60, isNotice: 1}) =>
    request({
        url:'/v1/resMonitorCycles.do',
        method,
        params: params
    })

// 原24小时告警趋势
// 现在改为一小时告警趋势
// export const getCountResMonitorCycles = (method = 'GET',params = {time: 60}) =>
export const getCountResMonitorCycles = (method = 'GET',params = {time: 1440}) =>
    request({
        url:'/v1/count/resMonitorCycles.do',
        method,
        params: params
    })

// 获取进出流量 ，默认是 进，出的参数是 traffic.out
export const getTrafficLoad = (method = 'GET', params = {
    metric: 'traffic.in'
}, data = {}) =>
    request({
        url: '/v1/resDashboardLine/trafficLoad.do',
        method,
        params,
        data
    })

// 获取线路延时，默认是 丢包率，平均延时 参数是 ping.avgDelay
export const getPing = (method = 'GET', params = {
    metric: 'ping.loss'
}) =>
    request({
        url: '/v1/resDashboardLine/ping.do',
        method,
        params,
    })

// 获取 设备详细信息
export const getHistory = (method = 'POST',params = {},data = {}) =>
    request({
        url: '/v1/graph/historys.do',
        method,
        params,
        data
    })


// 获取资源统计
export const getResourceStatistics = (method = 'GET',params = {},data ={}) =>
    request({
        url:'/v1/resourcesStatistics.do',
        method,
    })


// 获取资源利用率
// 4 -> cpu
// 5 -> 内存
// 6 -> 磁盘
export function getResourceStatisticsType(method = 'GET', params = {type: 4}){
    return request({
        url:`/v1/resourcesStatistics.do`,
        method,
        params,
    })
}

export function getUsages(method = 'GET',params = {}) {
    return request({
        url: '/v1/metric/usages.do',
        method,
        params
    })
}
