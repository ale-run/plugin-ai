<template>
  <div class="flex items-center justify-center" style="z-index: 99">
    <ClipLoader class="flex items-center justify-center" :loading="true" :color="color" :size="size" />
  </div>
</template>

<script lang="ts">
import { Component, Prop, Vue } from 'vue-property-decorator';
import ClipLoader from 'vue-spinner/src/ClipLoader.vue';

@Component({
  components: { ClipLoader }
})
export default class XSpinner extends Vue {
  @Prop({ default: '22px' }) public size!: string;
  @Prop({ default: 'var(--color-primary)' }) public color!: string;
}
</script>
