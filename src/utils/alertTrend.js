import * as echarts from 'echarts'
import dayjs from "dayjs";
import {byteTransform, lineDefaultEvent} from "@/utils/index";

let myChart;
/**
 *
 * @param elementId {String} 地图 id
 * @param data {Array}
 */
export default function initMap(elementId,data = []) {
    let [allAlarmList = [],newAlarmList = []] = data
    if (!myChart) createChart(elementId, data)
    else {
        myChart.dispatchAction({
            type: 'restore'
        })
        // 更新数据
        myChart.setOption({
            dataset: [
                {
                    source: allAlarmList
                },
                {
                    source: newAlarmList
                }
            ],
            toolbox: {
                feature: {
                    restore: {
                        show: false,
                    }
                }
            },
        })
    }
}
/**
 * @param id {String}
 * @param data {Array}
 */
export function createChart(id, data) {
    let [allAlarmList = [],newAlarmList = []] = data
    const sz_map = document.getElementById(id)
    myChart = echarts.init(sz_map)
    myChart.setOption( {
        dataset: [
            {
                dimensions: [
                    'timestamp',
                    'value'
                ],
                source: allAlarmList,
            },
            {
                dimensions: [
                    'timestamp',
                    'value'
                ],
                source: newAlarmList,
            },
        ],

        xAxis: {
            type: 'time',
            // boundaryGap: false,
            axisLine: { show: false, },
            axisTick: { show: false, },
            splitLine: {show: false },
            // show: false,
            axisLabel: {
                formatter: function (value) {
                    return dayjs(value * 1000).format('HH:mm')
                },
                color: '#fff',
            },
            interval: 24,
        },
        yAxis: {
            type: 'value',
            // scale: true, // 设置为 true 的话，值就不会从 0 开始
            splitNumber: 2,
            min: 0,
            boundaryGap: ['20%', '20%'],
            axisLine: {show: false},
            axisTick: {show: false},
            splitLine: {show: false},
        },
        tooltip: {
            trigger: 'axis',
            backgroundColor: '#191D32',
            extraCssText: 'box-shadow: 1px 0 2px 0 rgba(163,163,163,0.5)',
            formatter: function (val) {
                const time = dayjs(val[0].value.timestamp * 1000).format('YYYY/MM/DD HH:mm:ss')
                return `
                    <div class="tooltip">
                        <div class="tooltip-title note-circle-blue">${time}</div>
                         ${val.map(item => `
                             <div class="tooltip-content">
                                ${item.marker}
                                <span>${item.seriesName}</span>
                                <sapn style="padding: 0px 10px;"> ${item.value.value} </sapn>
                             </div>
                         `).join('\n')}
                    </div>
                `;
            }
        },
        // dataZoom: [
        //     {
        //         type: 'inside',
        //         xAxisIndex: 0,
        //         filterMode: 'none',
        //     }
        // ],
        // toolbox: {
        //     right: '40px',
        //     feature: {
        //         dataZoom: {
        //             yAxisIndex: false,
        //             show: true,
        //             title: {
        //                 zoom: '',
        //                 back: ''
        //             },
        //             // icon: {
        //             //     zoom: '',
        //             //     back: '',
        //             // }
        //         },
        //         restore: {
        //             title: '重置'
        //         }
        //     }
        // },

        grid: {
            top: '10%',
            bottom: '20%',
        },
        series: [
            {
                name: '累计告警数',
                type: 'line',
                symbol: "none",
                smooth: true,
                lineStyle: {
                    width: 1,
                    opacity: 1,
                },
                areaStyle: {
                    color: {
                        type: 'linear',
                        x: 0.5,
                        y: 0,
                        x2: 0.5,
                        y2: 1,
                        colorStops: [{
                            offset: 0, color: 'rgba(199,133,141,0.5)' // 0% 处的颜色
                        }, {
                            offset: 1, color: 'rgba(199,133,141,0.2)' // 100% 处的颜色
                        }],
                        global: false, // 缺省为 false,
                        opacity: 0.2,
                    },
                    opacity: 0.2,
                },
                datasetIndex: 0,
            },
            {
                name: '新建告警数',
                type: 'line',
                symbol: "none",
                smooth: true,
                lineStyle: {
                    width: 1,
                    opacity: 1,
                },
                areaStyle: {
                    color: {
                        type: 'linear',
                        x: 0.5,
                        y: 0,
                        x2: 0.5,
                        y2: 1,
                        colorStops: [{
                            offset: 0, color: 'rgba(199,133,141,0.5)' // 0% 处的颜色
                        }, {
                            offset: 1, color: 'rgba(199,133,141,0.2)' // 100% 处的颜色
                        }],
                        global: false, // 缺省为 false,
                        opacity: 0.2,
                    },
                    opacity: 0.2,
                },
                datasetIndex: 1,
            },
        ]
    })
    window.addEventListener("resize", myChart.resize)
    setTimeout(() => myChart.resize())
    // lineDefaultEvent(myChart)
}
