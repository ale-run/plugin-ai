<template>
  <XIcon
    :size="dataSize || '2xs'"
    :icon="model && model.icon"
    :class="{
      'bg-transparent': !model || !model.icon
    }"
  >
    <IconLogo
      :style="{
        margin: '0 auto',
        width: `85%`,
        height: 'auto'
      }"
    />
  </XIcon>
</template>

<script lang="ts">
import { Component, Vue, Prop, Watch } from 'vue-property-decorator';
import { sleep } from '@ale-run/connector';
import ai, { Model } from '@/client';

import XIcon from '@/components/common/x-icon.vue';
import IconLogo from '@/assets/logo.svg';

const cache = {};

@Component({
  components: {
    XIcon,
    IconLogo
  }
})
export default class AIModelIcon extends Vue {
  @Prop({ required: true }) public dataAssistantId: string;
  @Prop({ required: true }) public dataModel: string | Model;
  @Prop() public dataSize: string;

  public model: Model = null;

  public async reload() {
    if (!this.dataAssistantId || !this.dataModel || cache[this.dataAssistantId] || (this.dataModel && typeof this.dataModel === 'object')) {
      return;
    }

    cache[this.dataAssistantId] = true;

    const assistant = await ai.getAssistant(this.dataAssistantId);
    if (!assistant) throw new Error(`assistant ${this.dataAssistantId} not found`);

    const models = await assistant.listModel();
    cache[this.dataAssistantId] = models;
    this.model = models?.find((model) => model.name === this.dataModel);
  }

  public async mounted() {
    if (this.dataModel && typeof this.dataModel === 'object') {
      this.model = this.dataModel;
    } else if (typeof this.dataModel === 'string') {
      let models = cache[this.dataAssistantId];

      if (!models) {
        await this.reload();
      } else if (models === true) {
        for (let i = 0; i < 4 * 60; i++) {
          await sleep(250);
          models = cache[this.dataAssistantId];
          if (Array.isArray(models)) {
            this.model = models?.find((model) => model.name === this.dataModel);
            break;
          }
        }
      } else {
        this.model = models?.find((model) => model.name === this.dataModel);
      }
    }
  }
}
</script>
