<template>
  <div class="ai-usage w-full max-w-screen-xl self-center">
    <div class="x-navbar mb-4">
      <div class="x-navbar space-x-2">
        <h3 class="text-base font-medium px-1">
          사용량 조회 -
          <XDate :value="startdate" class="text-active font-medium" format="yyyy.mm" />
        </h3>
      </div>
      <div class="x-navbar space-x-2">
        <div class="flex">
          <div class="flex-1"></div>
          <div class="inline-flex items-center btn btn-md btn-default px-0 text-xs rounded">
            <a
              class="cursor-pointer bg-btn hover:bg-active hover:text-primary px-3 rounded-l"
              @click="toPrevMonth"
              v-if="getPrevMonth()"
              v-tooltip="getPrevMonth()"
            >
              <IconChevronLeft />
            </a>
            <a class="cursor-pointer bg-btn text-muted px-3 rounded-l" v-else>
              <IconChevronLeft />
            </a>

            <a
              class="cursor-pointer bg-btn hover:bg-active hover:text-primary px-3 rounded-r"
              @click="toNextMonth"
              v-if="getNextMonth()"
              v-tooltip="getNextMonth()"
            >
              <IconChevronRight />
            </a>
            <a class="cursor-pointer bg-btn text-muted px-3 rounded-r" v-else>
              <IconChevronRight />
            </a>
          </div>
        </div>
      </div>
    </div>

    <div class="x-card" v-if="list">
      <div class="grid grid-cols-1 gap-5">
        <AIUsageChart :data-usage-list="list" :data-start-date="startdate" />

        <div class="py-3">
          <div class="h-full fade-enter-active">
            <div class="flex flex-col mt-md" v-if="usageModels">
              <div class="border-t border-b border-t py-1 mb-1 bg-panel-em">
                <div class="px-3 w-full text-xs font-medium tracking-wide flex items-center">
                  <span class="flex-grow truncate">모델별</span>
                  <div class="visitors text-right min-w-100">입력 토큰</div>
                  <div class="visitors text-right min-w-100">출력 토큰</div>
                  <div class="percentage text-right min-w-100">%</div>
                </div>
              </div>
              <div>
                <div class="px-3 flex-grow">
                  <div class="py-1" v-for="model in usageModels" :key="model.name">
                    <div class="flex w-full items-center">
                      <div class="flex-grow w-full overflow-hidden">
                        <div class="w-full h-full relative">
                          <div
                            class="absolute bottom-0 left-0 h-[2px] rounded mx-1"
                            :class="{
                              'bg-info': model.percent > 30,
                              'bg-success': model.percent > 20,
                              'bg-warning': model.percent <= 20
                            }"
                            :style="`width: ${model.percent}%;`"
                            v-if="model.name !== 'total'"
                          ></div>
                          <div class="flex justify-start px-2 py-2 group text-xs text-active relative z-9 break-all w-full">
                            <a class="max-w-max w-full flex items-center md:overflow-hidden">
                              <span class="w-full md:truncate font-medium text-active" v-if="model.name === 'total'">합계</span>
                              <span class="w-full md:truncate text-muted" v-else-if="model.name === 'unknown'">(None)</span>
                              <span class="flex items-center space-x-2 md:truncate" v-else>
                                <XIcon class="hidden lg:flex ml-0 px-0 mr-1" size="3xs" :icon="model.icon" v-if="model.icon" />
                                {{ model.displayName || model.name }}
                                <small class="hidden lg:inline text-light">{{ model.name }}</small>
                              </span>
                            </a>
                          </div>
                        </div>
                      </div>
                      <div class="text-right min-w-100">
                        <span class="font-medium text-sm text-right">
                          <span v-tooltip="`${model.prompt ? model.prompt.toLocaleString() : 0} Tokens`">{{ toKilo(model.prompt) }}</span>
                        </span>
                      </div>
                      <div class="text-right min-w-100">
                        <span class="font-medium text-sm text-right">
                          <span v-tooltip="`${model.answer ? model.answer.toLocaleString() : 0} Tokens`">{{ toKilo(model.answer) }}</span>
                        </span>
                      </div>
                      <div class="text-right min-w-100">
                        <span class="font-medium text-sm text-right" v-if="model.percent">
                          <span v-tooltip="`Total ${model.total ? model.total.toLocaleString() : 0} Tokens`">{{ model.percent }}%</span>
                        </span>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </div>

            <div class="flex flex-col mt-md" v-if="usageChannels">
              <div class="border-t border-b border-t py-1 mb-1 bg-panel-em">
                <div class="px-3 w-full text-xs font-medium tracking-wide flex items-center">
                  <span class="flex-grow truncate">채널별</span>
                  <div class="visitors text-right min-w-100">입력 토큰</div>
                  <div class="visitors text-right min-w-100">출력 토큰</div>
                  <div class="percentage text-right min-w-100">%</div>
                </div>
              </div>
              <div>
                <div class="px-3 flex-grow">
                  <div class="py-1" v-for="channel in usageChannels" :key="channel.name">
                    <div class="flex w-full items-center">
                      <div class="flex-grow w-full overflow-hidden">
                        <div class="w-full h-full relative">
                          <div
                            class="absolute bottom-0 left-0 h-[2px] rounded mx-1"
                            :class="{
                              'bg-info': channel.percent > 30,
                              'bg-success': channel.percent > 20,
                              'bg-warning': channel.percent <= 20
                            }"
                            :style="`width: ${channel.percent}%;`"
                            v-if="channel.name !== 'total'"
                          ></div>
                          <div class="flex justify-start px-2 py-2 group text-xs text-active relative z-9 break-all w-full">
                            <a class="max-w-max w-full flex items-center md:overflow-hidden">
                              <span class="w-full md:truncate font-medium text-active" v-if="channel.name === 'total'">합계</span>
                              <span class="w-full md:truncate text-muted" v-else-if="channel.name === 'unknown'">(None)</span>
                              <span class="w-full md:truncate" v-else>{{ channel.displayName || channel.name }}</span>
                            </a>
                          </div>
                        </div>
                      </div>
                      <div class="text-right min-w-100">
                        <span class="font-medium text-sm text-right">
                          <span v-tooltip="`${channel.prompt ? channel.prompt.toLocaleString() : 0} Tokens`">{{ toKilo(channel.prompt) }}</span>
                        </span>
                      </div>
                      <div class="text-right min-w-100">
                        <span class="font-medium text-sm text-right">
                          <span v-tooltip="`${channel.answer ? channel.answer.toLocaleString() : 0} Tokens`">{{ toKilo(channel.answer) }}</span>
                        </span>
                      </div>
                      <div class="text-right min-w-100">
                        <span class="font-medium text-sm text-right" v-if="channel.percent">
                          <span v-tooltip="`Total ${channel.total ? channel.total.toLocaleString() : 0} Tokens`">{{ channel.percent }}%</span>
                        </span>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<script lang="ts">
import { Component, Vue, Prop, Watch } from 'vue-property-decorator';
import { Icon } from '@ale-run/connector';
import ai, { IAssistant, Usage } from '@/client';

import dateformat from 'dateformat';
import XDate from '@/components/common/x-date.vue';
import XIcon from '@/components/common/x-icon.vue';

import AIUsageChart from './ai-usage-chart.vue';

import IconChevronLeft from 'bootstrap-icons/icons/chevron-left.svg';
import IconChevronRight from 'bootstrap-icons/icons/chevron-right.svg';

@Component({
  components: {
    XDate,
    XIcon,
    AIUsageChart,
    IconChevronLeft,
    IconChevronRight
  }
})
export default class AIUsage extends Vue {
  @Prop({ required: true }) public dataAssistantId: string;

  public get assistantId(): string {
    return this.dataAssistantId;
  }

  public assistant: IAssistant = null;
  public list: Usage[] = null;
  public usageChannels: Array<{ name: string; displayName?: string; prompt: number; answer: number; total: number; percent?: number }> = null;
  public usageModels: Array<{
    name: string;
    displayName?: string;
    icon?: Icon;
    provider?: string;
    prompt: number;
    answer: number;
    total: number;
    percent?: number;
  }> = null;

  public startdate: Date = null;
  public enddate: Date = null;
  public loaded = false;

  @Watch('dataAssistantId')
  public async reload() {
    try {
      this.loaded = false;

      if (!this.assistantId) throw new Error(`dataAssistantId is required`);

      const assistant = await ai.getAssistant(this.assistantId);
      const models = await assistant.listModel();

      const list = await assistant.listUsage(this.startdate, this.enddate);

      const channelTotal = { name: 'total', prompt: 0, answer: 0, total: 0, percent: 100 };
      let usageChannels: Array<{ name: string; displayName?: string; prompt: number; answer: number; total: number; percent?: number }> = [];
      list.forEach((item) => {
        item?.channels?.forEach((c) => {
          if (!c.tokens?.total) return;
          const channelname = c.channel || 'unknown';
          const channel = usageChannels.find((i) => i.name === channelname);
          if (!channel) {
            usageChannels.push({
              name: channelname,
              prompt: c.tokens?.input || 0,
              answer: c.tokens?.output || 0,
              total: c.tokens?.total || 0
            });
          } else {
            channel.prompt += c.tokens?.input || 0;
            channel.answer += c.tokens?.output || 0;
            channel.total += c.tokens?.total || 0;
          }

          channelTotal.prompt += c.tokens?.input || 0;
          channelTotal.answer += c.tokens?.output || 0;
          channelTotal.total += c.tokens?.total || 0;
        });
      });

      usageChannels = usageChannels
        .map((channel) => {
          channel.percent = +((channel.total / channelTotal.total) * 100).toFixed(1);
          return channel;
        })
        .sort((a, b) => b.total - a.total);
      usageChannels.push(channelTotal);

      const modelTotal = { name: 'total', prompt: 0, answer: 0, total: 0, percent: 100 };
      let usageModels: Array<{
        name: string;
        displayName?: string;
        icon?: Icon;
        provider?: string;
        prompt: number;
        answer: number;
        total: number;
        percent?: number;
      }> = [];
      list.forEach((item) => {
        item?.models?.forEach((c) => {
          if (!c.tokens?.total) return;
          const modelname = c.model || 'unknown';
          const model = usageModels.find((i) => i.name === modelname);
          const modelobj = models.find((m) => m.name === modelname);
          if (!model) {
            usageModels.push({
              name: modelname,
              displayName: modelobj?.displayName,
              icon: modelobj?.icon,
              provider: modelobj?.provider,
              prompt: c.tokens?.input || 0,
              answer: c.tokens?.output || 0,
              total: c.tokens?.total || 0
            });
          } else {
            model.prompt += c.tokens?.input || 0;
            model.answer += c.tokens?.output || 0;
            model.total += c.tokens?.total || 0;
          }

          modelTotal.prompt += c.tokens?.input || 0;
          modelTotal.answer += c.tokens?.output || 0;
          modelTotal.total += c.tokens?.total || 0;
        });
      });

      usageModels = usageModels
        .map((model) => {
          model.percent = +((model.total / modelTotal.total) * 100).toFixed(1);
          return model;
        })
        .sort((a, b) => b.total - a.total);
      usageModels.push(modelTotal);

      this.assistant = assistant;
      this.list = list;
      this.usageChannels = usageChannels;
      this.usageModels = usageModels;
    } catch (err) {
      console.error(err);
      this.$emit('error', err);
      throw err;
    } finally {
      this.loaded = true;
    }
  }

  public async mounted() {
    const base = new Date();
    this.startdate = new Date(base.getFullYear(), base.getMonth(), 1);
    this.enddate = new Date(base.getFullYear(), base.getMonth() + 1, 1);
    await this.reload();
  }

  public async toPrevMonth() {
    const base = this.startdate || new Date();
    this.startdate = new Date(base.getFullYear(), base.getMonth() - 1, 1);
    this.enddate = new Date(base.getFullYear(), base.getMonth(), 1);
    await this.reload();
  }

  public async toNextMonth() {
    const base = this.startdate || new Date();
    this.startdate = new Date(base.getFullYear(), base.getMonth() + 1, 1);
    this.enddate = new Date(base.getFullYear(), base.getMonth() + 2, 1);
    await this.reload();
  }

  public getPrevMonth(): string {
    if (!this.startdate) return null;
    if (!(new Date().getTime() - this.startdate.getTime() > 6 * 31 * 24 * 60 * 60 * 1000)) {
      const base = this.startdate || new Date();
      return dateformat(new Date(base.getFullYear(), base.getMonth() - 1, 1), 'yyyy-mm');
    } else {
      return null;
    }
  }

  public getNextMonth(): string {
    if (!this.enddate) return null;
    if (new Date().getTime() - this.enddate.getTime() > 0) {
      const base = this.startdate || new Date();
      return dateformat(new Date(base.getFullYear(), base.getMonth() + 1, 1), 'yyyy-mm');
    } else {
      return null;
    }
  }

  public toKilo(num: number) {
    if (!num) return `0`;
    if (num < 1000) {
      return num.toString();
    } else if (num < 1000000) {
      return (num / 1000).toFixed(1) + 'K';
    } else if (num < 1000000000) {
      return (num / 1000000).toFixed(1) + 'M';
    } else {
      return (num / 1000000000).toFixed(1) + 'B';
    }
  }
}
</script>
