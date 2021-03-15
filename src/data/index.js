// 注册地图
import * as echarts from "echarts";
import map from "@/data/shenzhen.json";

echarts.registerMap(map.name, map) // 注册深圳地图

export const mapName = map.name
export const title = map.title
