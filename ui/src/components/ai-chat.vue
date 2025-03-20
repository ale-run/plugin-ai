<template>
  <div class="flex flex-1 max-h-full" v-if="assistant">
    <div class="flex-1 flex flex-col">
      <div class="flex-1 flex flex-col">
        <AIThread ref="threadUI" :data-assistant="assistant" :data-thread="thread" class="flex-1 flex flex-col" />
        <div class="flex-0 md:p-3 md:pb-5">
          <AIPrompt
            ref="promptUI"
            class="bg-input border-t md:border md:rounded-lg max-w-screen-lg mx-auto"
            :data-assistant="assistant"
            :data-thread="thread"
            @ask="onAsk"
          />
        </div>
      </div>
    </div>
  </div>
</template>

<script lang="ts">
import { Component, Vue, Prop, Watch, Ref } from 'vue-property-decorator';
import ai, { IAssistant, IThread } from '@/client';

import swal from 'sweetalert';

import AIMember from './ai-member.vue';
import AIThread from './ai-thread.vue';
import AIPrompt from './ai-prompt.vue';

import IconStar from '@/assets/icons/star.svg';
import IconCircleFadingPlus from '@/assets/icons/circle-fading-plus.svg';
import IconCopy from '@/assets/icons/copy.svg';
import IconSettings from '@/assets/icons/settings.svg';
import IconShare from '@/assets/icons/share.svg';
import IconTrash2 from '@/assets/icons/trash-2.svg';
import IconUserPlus from '@/assets/icons/user-plus.svg';
import IconPanelRight from '@/assets/icons/panel-right.svg';
import IconEllipsisVertical from '@/assets/icons/ellipsis-vertical.svg';

@Component({
  components: {
    AIMember,
    AIThread,
    AIPrompt,
    IconStar,
    IconCircleFadingPlus,
    IconCopy,
    IconSettings,
    IconShare,
    IconTrash2,
    IconUserPlus,
    IconPanelRight,
    IconEllipsisVertical
  }
})
export default class AIChat extends Vue {
  @Prop({ required: true }) public dataAssistantId: string;
  @Prop() public dataThreadId: string;

  @Ref()
  public threadUI: AIThread;
  @Ref()
  public promptUI: AIPrompt;

  public loaded = false;

  public assistant: IAssistant = null;
  public thread: IThread = null;
  public lastScrollTop = 0;

  @Watch('dataAssistantId')
  public async reload() {
    try {
      this.loaded = false;

      if (!this.dataAssistantId) throw new Error(`dataAssistantId is required`);

      const assistant = await ai.getAssistant(this.dataAssistantId);
      if (!assistant) throw new Error(`assistant "${this.dataAssistantId}" does not exist`);

      const threadid = this.dataThreadId || this.thread?.id;
      const threadlist = await assistant.listThread();
      const thread = threadid
        ? await assistant.getThread(threadid)
        : threadlist?.rows?.length
        ? await assistant.getThread(threadlist?.rows[0].id)
        : null;

      this.assistant = assistant;
      this.thread = thread;
    } catch (err) {
      console.error(err);
      this.$emit('error', err);
      throw err;
    } finally {
      this.loaded = true;
    }
  }

  public async mounted() {
    await this.reload();
  }

  public async onAsk({ ask }) {
    if (!this.thread) {
      this.thread = await this.assistant?.createThread(ask.owner);

      this.$emit('created', {
        assistant: this.assistant,
        thread: this.thread
      });
    }

    this.promptUI.setEnable(false);
    await this.threadUI?.run(ask);
    this.promptUI.setEnable(true);

    this.$emit('prompt', {
      assistant: this.assistant,
      thread: this.thread,
      ask
    });
  }

  public async removeThread() {
    if (!this.assistant) throw new Error(`assistatnt is required`);
    if (!this.thread) throw new Error(`thread is required`);

    if (
      await swal({
        title: '스레드를 삭제하시겠습니까?', // this.$t('AIChat.removeconfirm')?.toString(),
        icon: 'info',
        buttons: [true, true]
      })
    ) {
      await this.assistant.removeThread(this.thread.id);

      this.$emit('removed', {
        assistant: this.assistant,
        thread: this.thread
      });

      await this.reload();
      this.thread = null;
    }
  }
}
</script>
