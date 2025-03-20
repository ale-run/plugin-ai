<template>
  <div class="ai-usage-chart p-5 pr-[2px]">
    <div style="height: 350px" ref="chart"></div>
  </div>
</template>

<script lang="ts">
import { Component, Vue, Prop, Ref, Watch } from 'vue-property-decorator';
import { Usage } from '@/client';
import dateformat from 'dateformat';

import * as echarts from 'echarts/core';
import { TitleComponent, ToolboxComponent, TooltipComponent, GridComponent, DataZoomComponent } from 'echarts/components';
import { LineChart } from 'echarts/charts';
import { UniversalTransition } from 'echarts/features';
import { CanvasRenderer } from 'echarts/renderers';
import { LegendComponent } from 'echarts/components';

echarts.use([
  TitleComponent,
  ToolboxComponent,
  TooltipComponent,
  GridComponent,
  DataZoomComponent,
  LineChart,
  CanvasRenderer,
  UniversalTransition,
  LegendComponent
]);

@Component
export default class AIUsageChart extends Vue {
  @Prop({ required: true }) public dataUsageList: Usage[];
  @Prop({ required: true }) public dataStartDate: Date;

  @Ref()
  public chart: HTMLElement;
  public echart: any;

  public get list(): Usage[] {
    return this.dataUsageList;
  }

  public async mounted() {
    const dom = this.chart;
    this.echart = echarts.init(dom);
    window.addEventListener('resize', this.onResize);
    await this.reload();
  }

  public async unmounted() {
    window.removeEventListener('resize', this.onResize);
  }

  public onResize() {
    this.echart?.resize();
  }

  @Watch('dataUsageList')
  public async reload() {
    const echart = this.echart;

    const dates = this.getDates();
    const list = this.list;
    const dataPromptToken = [];
    const dataAnswerToken = [];
    const dataToken = [];

    dates.forEach((date) => {
      const value = list?.find((item) => item.date === date);
      dataPromptToken.push(value?.total?.input || 0);
      dataAnswerToken.push(value?.total?.output || 0);
      dataToken.push(value?.total?.total || 0);
    });

    echart.setOption({
      color: ['rgb(89, 179, 240)', 'rgb(158, 134, 202)'],
      tooltip: {
        trigger: 'axis',
        backgroundColor: 'var(--color-bg-base)',
        borderColor: 'var(--color-border)',
        className: 'p-3',
        textStyle: {
          color: 'var(--color-text)',
          fontSize: 12,
          fontWeight: 'normal'
        },
        axisPointer: {
          type: 'cross',
          label: {
            backgroundColor: '#6a7985'
          }
        },
        valueFormatter: (value) => {
          return value.toLocaleString() + ' Token';
        }
      },
      grid: {
        top: 20,
        bottom: 0,
        left: '5%',
        right: '0%',
        containLabel: true
      },
      xAxis: {
        type: 'category',
        boundaryGap: true,
        show: true,
        data: dates,
        splitLine: {
          show: false,
          lineStyle: {
            color: 'rgba(127,127,127,0.05)'
          }
        },
        axisLabel: {
          formatter: (value) => `${new Date(value).getDate()}일`
        }
      },
      yAxis: {
        type: 'value',
        boundaryGap: false,
        show: true,
        splitLine: {
          show: true,
          lineStyle: {
            color: 'rgba(127,127,127,0.05)'
          }
        },
        axisLabel: {
          formatter: '{value}'
        }
      },
      series: [
        {
          name: '출력 토큰',
          type: 'line',
          smooth: true,
          showSymbol: true,
          animationDuration: 200,
          emphasis: {
            focus: 'series'
          },
          lineStyle: {
            color: 'rgb(89, 179, 240)',
            width: 1,
            type: 'solid'
          },
          areaStyle: {
            color: new echarts.graphic.LinearGradient(0, 0, 0, 1, [
              {
                offset: 0,
                color: 'rgba(89, 179, 240, 0.2)'
              },
              {
                offset: 1,
                color: 'rgba(89, 179, 240, 0)'
              }
            ])
          },
          data: dataAnswerToken
        },
        {
          name: '입력 토큰',
          type: 'line',
          smooth: true,
          showSymbol: true,
          animationDuration: 200,
          emphasis: {
            focus: 'series'
          },
          lineStyle: {
            color: 'rgb(158, 134, 202)',
            width: 1,
            type: 'solid'
          },
          areaStyle: {
            color: new echarts.graphic.LinearGradient(0, 0, 0, 1, [
              {
                offset: 0,
                color: 'rgba(158, 134, 202, 0.2)'
              },
              {
                offset: 1,
                color: 'rgba(158, 134, 202, 0)'
              }
            ])
          },
          data: dataPromptToken
        }
        /*
        {
          name: 'Total',
          type: 'line',
          smooth: true,
          showSymbol: false,
          animationDuration: 200,
          emphasis: {
            focus: 'series'
          },
          lineStyle: {
            color: 'rgb(255, 180, 53)',
            width: 1,
            type: 'solid'
          },
          areaStyle: {
            color: new echarts.graphic.LinearGradient(0, 0, 0, 1, [
              {
                offset: 0,
                color: 'rgba(255, 180, 53, 0.2)'
              },
              {
                offset: 1,
                color: 'rgba(255, 180, 53, 0)'
              }
            ])
          },
          data: dataAnswerToken
        }
        */
      ]
    });
  }

  private getDates(): string[] {
    const date = this.dataStartDate || new Date();
    const year = date.getFullYear();
    const month = date.getMonth();

    const firstDay = new Date(year, month, 1);
    const lastDay = new Date(year, month + 1, 0);

    const dates: string[] = [];
    for (const currentDate = new Date(firstDay); currentDate <= lastDay; currentDate.setDate(currentDate.getDate() + 1)) {
      dates.push(dateformat(currentDate, 'yyyy-mm-dd'));
    }

    return dates;
  }
}
</script>
