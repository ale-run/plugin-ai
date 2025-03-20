<template>
  <div class="ai-assistant flex flex-1 max-h-full" v-if="deployment">
    <div class="hidden 2xl:flex flex-col min-w-300 border-r" v-if="!tab">
      <div class="p-3">
        <div class="flex items-center text-sm text-light font-normal rounded pl-2 pr-3 bg-input border border-light">
          <IconSearch class="mr-3 flex-none" />
          <input
            type="text"
            class="x-form-control x-form-control-sm border-0 m-0 p-0 w-full outline-none text-sm"
            placeholder="검색하기"
            style="min-height: 2.5rem"
          />
        </div>
      </div>

      <a class="btn btn-black block my-2 mx-3" @click="createThread()">새로운 쓰레드</a>

      <div class="flex-1 flex flex-col">
        <div class="flex-1 flex flex-col relative overflow-x-hidden overflow-y-auto scrollbar overscroll-y-contain">
          <AIThreads
            class="absolute top-0 bottom-0 right-0 left-0 max-w-full"
            :data-deployment="deployment"
            :data-threads="threads"
            :data-thread="thread"
            @select="onThreadSelected"
          />
        </div>
      </div>
    </div>

    <!-- center -->
    <div class="flex-1 flex flex-col">
      <!-- top bar -->
      <div class="flex-0 py-3 px-5 mb-3 flex items-center">
        <div class="flex-1 inline-flex items-center space-x-2">
          <div class="2xl:hidden x-dropdown static xl:relative">
            <a class="btn btn-sm py-[2px] px-4 btn-default m-0 font-semibold text-xs flex items-center" v-if="thread">
              <span class="font-light mr-1">쓰레드 ›</span>
              <span class="text-2xs text-active">{{ thread.summary || '새로운 쓰레드' }}</span>
            </a>
            <a class="btn btn-sm py-[2px] px-4 btn-black m-0 font-semibold text-xs flex items-center" v-else>
              <span class="font-light mr-1">새로운 쓰레드</span>
            </a>
            <div class="x-dropdown-items w-full xl:w-max px-5 xl:px-0">
              <div class="x-contextmenu">
                <div class="x-list x-list-hover min-w-full xl:min-w-500">
                  <div class="px-3 my-3">
                    <div
                      class="x-dropdown-prevent-close w-full flex items-center text-sm text-light font-normal rounded pl-2 pr-3 bg-input border border-light"
                    >
                      <IconSearch class="mr-3 flex-none" />
                      <input type="text" class="x-form-control border-0 m-0 p-0 w-full outline-none text-sm" placeholder="검색하기" />
                    </div>

                    <a class="btn btn-black block my-2 mx-0" @click="createThread()">새로운 쓰레드</a>
                  </div>

                  <template v-if="true">
                    <AIThreads
                      class="max-h-350 overflow-auto overscroll-contain"
                      :data-deployment="deployment"
                      :data-threads="threads"
                      :data-thread="thread"
                      @select="onThreadSelected"
                    />
                  </template>
                </div>
              </div>
            </div>
          </div>
        </div>
        <div class="inline-flex items-center py-[2px] px-[2px] bg-btn text-xs font-semibold rounded-sm">
          <a
            class="cursor-pointer hover:text-primary py-1 px-3 rounded-sm"
            :class="{
              'bg-panel text-primary': !tab
            }"
            @click="setTab('')"
          >
            대화 내역
          </a>
          <a
            class="cursor-pointer hover:text-primary py-1 px-3 rounded-sm"
            :class="{
              'bg-panel text-primary': tab === 'usage'
            }"
            @click="setTab('usage')"
          >
            사용량
          </a>
        </div>
      </div>
      <!-- // top bar -->

      <!-- Chatting -->
      <div class="flex-1 flex flex-col" v-if="!tab">
        <AIChat v-if="assistant" :data-assistant-id="assistant.id" />
      </div>
      <!-- // Chatting -->

      <!-- Usage -->
      <div class="flex-1 flex flex-col p-5" v-else-if="tab === 'usage'">
        <AIUsage v-if="assistant" :data-assistant-id="assistant.id" />
      </div>
      <!-- // Usage -->
    </div>
    <!-- // center -->
  </div>
</template>

<script lang="ts">
import { Component, Vue, Prop, Watch } from 'vue-property-decorator';
import { IDeployment, Workbench } from '@ale-run/connector';
import ai, { IAssistant, IThread, ThreadInfo, Answer } from '@/client';

import AIChat from './ai-chat.vue';
import AIUsage from './ai-usage.vue';
import AIThreads from './ai-threads.vue';

import IconSearch from '@/assets/icons/search.svg';

@Component({
  components: {
    AIChat,
    AIUsage,
    AIThreads,
    IconSearch
  }
})
export default class AIAssistant extends Vue {
  @Prop({ required: true }) public dataDeployment: IDeployment;
  @Prop() public dataTab: string;

  public tab: string = null;
  public loaded = false;
  public deployment: IDeployment = null;
  public assistant: IAssistant = null;
  public thread: IThread = null;
  public threads: ThreadInfo[] = null;
  public answers: Answer[] = null;

  @Watch('dataDeployment')
  public async reload() {
    try {
      this.loaded = false;

      if (!this.dataDeployment) throw new Error(`prop "dataDeployment" is required`);

      const deployment = this.dataDeployment;
      const assistant = await ai.getAssistantByName(deployment.id);

      console.log('assistant', assistant);

      this.deployment = deployment;
      this.assistant = assistant;

      await this.reloadThread();
    } catch (err) {
      console.error(err);
      this.$emit('error', err);
      throw err;
    } finally {
      this.loaded = true;
    }
  }

  public async reloadThread(threadid?: string) {
    if (!this.assistant) return;

    try {
      this.loaded = false;

      threadid = threadid || this.thread?.id;

      const threadlist = await this.assistant.listThread();
      const thread = threadid
        ? await this.assistant.getThread(threadid)
        : threadlist?.rows?.length
        ? await this.assistant.getThread(threadlist?.rows[0].id)
        : null;
      const answers = thread ? await thread.listAnswer() : null;

      this.threads = threadlist?.rows;

      this.thread = thread;
      this.answers = answers?.rows;
    } catch (err) {
      console.error(err);
      this.$emit('error', err);
      throw err;
    } finally {
      this.loaded = true;
    }
  }

  public async mounted() {
    this.tab = this.dataTab;
    await this.reload();
  }

  public onThreadSelected(thread) {
    if (!thread.id) return;
    this.reloadThread(thread.id);
  }

  public async createThread() {
    this.thread = null;
    this.answers = null;
  }

  public setTab(tab: string) {
    this.tab = tab || '';
    this.$emit('tab', tab);
  }

  @Watch('dataTab')
  private watchTab() {
    this.setTab(this.dataTab);
  }
}
</script>
