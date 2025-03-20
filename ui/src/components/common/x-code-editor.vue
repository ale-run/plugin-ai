<template>
  <div class="x-code-editor" @click="layout()">
    <monaco-editor
      ref="monaco"
      class="x-code-editor-monaco"
      v-model="code"
      :language="lang"
      :theme="theme"
      :options="{
        automaticLayout: true,
        readOnly: readonly,
        wordWrap: wordWrap === true ? 'on' : 'off'
      }"
    />
  </div>
</template>

<script lang="ts">
import { Component, Model, Prop, Vue, Watch } from 'vue-property-decorator';

@Component({
  components: { MonacoEditor: () => import('vue-monaco') }
})
export default class XCodeEditor extends Vue {
  @Model() public readonly value!: string;
  @Prop() public dataLang!: string;
  @Prop() public dataTheme!: string;
  @Prop({ type: Boolean, default: false }) public readonly!: boolean;
  @Prop({ type: Boolean, default: false }) public wordWrap!: boolean;

  public code = this.value;

  public get lang(): string {
    return this.dataLang || 'text';
  }

  public get theme(): string {
    const defaultTheme =
      (window.matchMedia && window.matchMedia('(prefers-color-scheme: dark)').matches) || document.body.classList.contains('theme-dark')
        ? 'dark'
        : 'light';
    return `vs-${this.dataTheme || defaultTheme}`;
  }

  public layout() {
    // @ts-ignore
    this.$refs.monaco.editor.layout();
  }

  @Watch('code', { immediate: true })
  public watchcode() {
    this.$emit('input', this.code);
    this.$emit('change', this.code);
  }

  @Watch('value', { immediate: true })
  public watchvalue() {
    this.code = this.value;
  }
}
</script>

<style lang="postcss">
.x-code-editor {
  width: 100%;

  & .x-code-editor-monaco {
    width: 100%;
    height: 100%;
    min-height: 500px;
  }
}
</style>
