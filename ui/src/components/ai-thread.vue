<template>
  <div ref="chat" class="relative overflow-y-auto scrollbar overscroll-y-contain">
    <div class="absolute top-0 bottom-0 right-0 left-0 p-3 md:p-5">
      <div class="space-y-5 pb-16 mx-auto max-w-screen-lg" v-if="thread && answers && answers.length">
        <template v-for="answer in answers" :key="answer.id">
          <!-- line -->
          <div class="py-10 text-xs flex items-center text-light">
            <div class="flex-1 h-1 border-t"></div>
            <div class="px-4">
              <XDate :value="answer.createdAt" format="yyyy.mm.dd (ddd)" />
            </div>
            <div class="flex-1 h-1 border-t"></div>
          </div>
          <!-- // chat -->

          <AIAnswer :data-thread="thread" :data-answer="answer" :data-result="answer.result" :data-error="answer.error" />
        </template>
      </div>
      <div class="h-full flex items-center justify-center" v-else-if="thread">
        <div class="text-center space-y-16">
          <IconLogo class="inline grayscale opacity-20" width="3.5rem" height="3.5rem" />
        </div>
      </div>
      <div class="h-full flex items-center justify-center" v-else>
        <div class="text-center space-y-16">
          <div class="space-y-8">
            <div class="space-y-8 opacity-70">
              <IconLogo class="inline" width="3.5rem" height="3.5rem" />
            </div>
            <div class="text-xs text-light mt-3">프롬프트를 입력하고 스레드를 시작하세요.</div>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<script lang="ts">
import { Component, Vue, Prop, Watch, Ref } from 'vue-property-decorator';
import { IAssistant, IThread, Answer, Ask, StreamResponse, ANSWER_STATUS } from '@/client';

import XDate from '@/components/common/x-date.vue';
import XUserIcon from '@/components/common/x-user-icon.vue';
import IconLogo from '@/assets/logo.svg';

import AIAnswer from './ai-answer.vue';

import IconPlus from 'bootstrap-icons/icons/plus-lg.svg';
import IconEnter from 'bootstrap-icons/icons/arrow-return-left.svg';
import IconSearch from '@/assets/icons/search.svg';
import IconBookOpenCheck from '@/assets/icons/book-open-check.svg';
import IconDatabaseZap from '@/assets/icons/database-zap.svg';
import IconBlocks from '@/assets/icons/blocks.svg';
import IconBotMessageSquare from '@/assets/icons/bot-message-square.svg';
import IconBrainCircuit from '@/assets/icons/brain-circuit.svg';

@Component({
  components: {
    IconLogo,
    AIAnswer,
    XDate,
    XUserIcon,
    IconPlus,
    IconEnter,
    IconSearch,
    IconBookOpenCheck,
    IconDatabaseZap,
    IconBlocks,
    IconBotMessageSquare,
    IconBrainCircuit
  }
})
export default class AIThread extends Vue {
  @Prop() public dataAssistant: IAssistant;
  @Prop() public dataThread: IThread;

  @Ref()
  private chat: HTMLElement;

  public threadCreated: IThread = null;
  public loaded = false;
  public scrollToBottomTimeout = null;
  public lastScrollTop = 0;
  public processing = false;

  public answers: Answer[] = null;

  public get assistant(): IAssistant {
    return this.dataAssistant || this.dataThread?.getAssistant();
  }

  public get thread(): IThread {
    return this.dataThread || this.threadCreated;
  }

  @Watch('dataThread')
  public async reload() {
    try {
      this.loaded = false;

      const thread = this.dataThread;
      if (!thread) return;

      if (this.answers) await thread.reload();
      const answers = await thread.listAnswer();

      this.answers = answers?.rows;
    } catch (err) {
      console.error(err);
      this.$emit('error', err);
      throw err;
    } finally {
      this.loaded = true;
      this.scrollToBottom();
    }
  }

  public async mounted() {
    await this.reload();
    this.chat?.addEventListener('scroll', this.handleScroll, { passive: true });
  }

  public async unmounted() {
    this.chat?.removeEventListener('scroll', this.handleScroll);
  }

  public async run(ask: Ask) {
    const answer = {
      id: 'temporary',
      model: ask.model,
      assistantId: this.assistant.id,
      threadId: this.thread.id,
      status: ANSWER_STATUS.inprogress,
      result: '',
      ask,
      createdAt: new Date()
    } as Answer;

    if (!this.answers) this.answers = [];
    this.answers.push(answer);

    this.scrollToBottom(10);

    try {
      const stream: StreamResponse = (await this.thread.run(ask)) as StreamResponse;

      this.scrollToBottom();

      console.log('ask', ask);

      stream
        .on('data', (data) => {
          if (!data) return;
          answer.result += data.toString();
          this.$forceUpdate();
          this.scrollToBottom(10);
        })
        .on('error', async (err) => {
          console.error(err);
          this.processing = false;
          await this.reload();
        })
        .on('end', async () => {
          this.processing = false;
          await this.reload();
        });
    } catch (err) {
      console.error(err);
      // Workbench.toast(err);
      answer.error = err.message;
      this.$forceUpdate();
      this.processing = false;
    }
  }

  public handleScroll() {
    if (this.chat) {
      this.lastScrollTop = this.chat.scrollTop;
    }
  }

  public scrollToBottom(throttle?: number) {
    if (!throttle && this.chat) this.chat.scrollTop = this.chat.scrollHeight;

    if (this.scrollToBottomTimeout) clearTimeout(this.scrollToBottomTimeout);

    this.scrollToBottomTimeout = setTimeout(() => {
      if (this.chat) {
        this.chat.scrollTop = this.chat.scrollHeight;
        this.lastScrollTop = this.chat.scrollTop;
      }
    }, throttle || 10);
  }
}
</script>
