<template>
  <div>
    <a :href="`${link || '#'}`" :target="`${(link && '_blank') || ''}`" rel="noopener noreferrer nofollow">
      <span>{{ value.endpoint || '(internal)' }}</span>
      :
      <span class="font-semibold text-info">{{ value.port }}</span>
      <IconArrowRightShort class="icon mx-1" />
      <span class="font-semibold text-info">:{{ value.targetPort }}</span>
      /
      <span class="font-semibold text-xs">{{ value.protocol }}</span>
    </a>
  </div>
</template>

<script lang="ts">
import { Component, Prop, Vue } from 'vue-property-decorator';
import IconArrowRightShort from 'bootstrap-icons/icons/arrow-right-short.svg';

@Component({
  components: {
    IconArrowRightShort
  }
})
export default class XServiceExpose extends Vue {
  @Prop() public value?: any;

  public get link() {
    const v = this.value;
    return `http://localhost:${v.port}`;
  }
}
</script>
