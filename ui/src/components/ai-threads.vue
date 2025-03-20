<template>
  <div class="ai-thread" v-if="threads">
    <div class="x-list x-list-hover">
      <div class="x-list-header hidden"></div>
      <div
        class="x-list-item cursor-pointer mx-2"
        v-for="thread in threads"
        :key="thread.id"
        @click="select(thread)"
        :class="{
          'bg-active ring-1 ring-sky-500': current && current.id === thread.id
        }"
      >
        <div class="flex-1">
          <div class="flex items-center space-x-2">
            <span class="font-medium text-xs flex items-center">
              {{ thread.summary || '새로운 쓰레드' }}
            </span>
          </div>
          <div class="text-2xs mt-1">
            <span class="text-primary">
              <XDate :value="thread.updatedAt || thread.createdAt" format="rel" />
            </span>
            <span class="mx-1" v-if="thread.latest?.channel">·</span>
            <span class="x-label x-label-2xs x-label-default mx-0" v-if="thread.latest?.channel">{{ thread.latest?.channel }}</span>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<script lang="ts">
import { Component, Vue, Prop } from 'vue-property-decorator';
import { ThreadInfo, IThread } from '@/client';

import XDate from '@/components/common/x-date.vue';

@Component({
  components: {
    XDate
  }
})
export default class AIThreads extends Vue {
  @Prop({ required: true }) public dataThreads: ThreadInfo[];
  @Prop() public dataThread: IThread;

  public get threads(): ThreadInfo[] {
    return this.dataThreads;
  }

  public get current(): IThread {
    return this.dataThread;
  }

  public select(thread) {
    this.$emit('select', thread);
  }
}
</script>
