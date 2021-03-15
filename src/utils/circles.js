import * as echarts from "echarts";

let myCharts = []
let init = true
/**
 * @param elementId {String}
 * @param data {Array<{
 *     name: String,
 *     value: number
 * }>}
 */
export default function initCircles(elementId,data){

    if (init) {
        createChart(elementId,data)
        init = false
    }
    else {
        myCharts.forEach((item,index) => {
            item.setOption({
                title: {
                    text: `${data[index].value}%`,
                },
                series: [
                    {
                        name: 'circle',
                        data: getCircleData(data[index].name,data[index].value)
                    }
                ]
            })
        })
    }
}

/**
 *
 * @param element {String}
 * @param data {Array<{
 *     name: String,
 *     value: number
 * }>}
 */
function createChart(element,data){
    let circles = document.getElementById(element).childNodes
    myCharts = [].map.call(circles,(item,index) => {
        const myChart = echarts.init(item)
        myChart.setOption({
            title: {
                text: `${data[index].value}%`,
                x: 'center',
                y: 'center',
                textStyle: {
                    fontWeight: 'normal',
                    color: '#29EEF3',
                },
            },
            tooltip: {
                backgroundColor: '#000',
                formatter: function(val) {
                    return `
                    <div class="tooltip">
                        <div class="tooltip-title note-circle-blue">${val.name}</div>
                        <div class="tooltip-content">
                        <span>${val.marker}</span>
                        <span>${val.value}</span>
                        </div>
                    </div>
                `;
                }
            },
            legend: {
                show: false,
            },

            series: [{
                name: 'circle',
                type: 'pie',
                clockWise: true,
                radius: ['50%', '66%'],
                itemStyle: {
                    normal: {
                        label: {
                            show: false
                        },
                        labelLine: {
                            show: false
                        },
                        color: function(params) {
                            return {
                                type: 'linear',
                                ...getValuePieColor(params.value)
                            }
                        }
                    }
                },
                hoverAnimation: false,
                data: getCircleData(data[index].name,data[index].value)
            }]
        })
        window.addEventListener("resize", myChart.resize)
        setTimeout(() => myChart.resize())
        return myChart
    })
}

/**
 * 获取 pie 图渐变颜色
 * @param value
 * @return {{
 *     x: number,
 *     y: number,
 *     x2: number,
 *     y2: number,
 *     colorStops: Array<{offset: number,color: string}>
 * }}
 */
function getValuePieColor(value){
    const colorStops = [ // 默认起始颜色
        {offset: 0, color: '#0A73FF'},
    ]
    const colors = ['#79DAFF','#FFF279','#E54F39'] // 三种颜色
    // [x, 60)
    if (value < 60) {
        return {
            x: 0.5,
            y: 0,
            x2: 0.5,
            y2: 1,
            colorStops: [...colorStops,{offset: 1, color: colors[0]}]
        }
    }
    // [60 - 80)
    if (value < 80) {
        return {
            x: 1,
            y: 0,
            x2: 0.25,
            y2: 1,
            colorStops: [
                ...colorStops,
                {offset: 0.5, color: colors[0]},
                {offset: 1, color: colors[1]},
            ]
        }
    }

    // [80 - x]
    return {
        x: 1,
        y: 1,
        x2: 0.25,
        y2: 0.25,
        colorStops: [
            ...colorStops,
            {offset: 0.33, color: colors[0]},
            {offset: 0.66, color: colors[1]},
            {offset: 1, color: colors[2]},
        ]
    }
}

function getCircleData(name,value){
    return  [
        {
            value: value,
            name: name,
            itemStyle: {
                normal: {
                    label: {
                        show: false
                    },
                    labelLine: {
                        show: false
                    }
                }
            }
        },
        {
            name: '剩余',
            value: 100 - value,
            itemStyle: {
                normal: {
                    color: '#90A0AE'
                }
            }
        }
    ]
}
