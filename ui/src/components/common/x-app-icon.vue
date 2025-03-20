<template>
  <div
    class="x-iconbox text-active flex items-center justify-center relative"
    @click="onClick"
    :class="{
      'x-iconbox-xl': size === 'xl',
      'x-iconbox-lg': size === 'lg',
      'x-iconbox-sm': size === 'sm',
      'x-iconbox-xs': size === 'xs',
      'x-iconbox-2xs': size === '2xs',
      'x-iconbox-3xs': size === '3xs',
      'x-iconbox-md': size === 'md',
      'radius-circle': calcshape === 'circle',
      'radius-smooth': calcshape === 'smooth'
    }"
    :style="{
      'color': (appicon && appicon.foreground) || 'auto',
      'background-color': (appicon && appicon.background) || 'auto'
    }"
  >
    <img
      v-if="appicon"
      :src="appicon.src"
      :style="{
        margin: '0 auto',
        width: `${100 * (appicon.scale || 1)}%`,
        height: (appicon.scale && `${100 * appicon.scale}%`) || 'auto'
      }"
    />
    <slot v-if="!appicon">
      <div
        class="absolute top-0 left-0 bottom-0 right-0 flex justify-center items-center text-center text-base font-medium text-primary"
        :class="`${bg.bg || 'bg-gray-500/30'} ${bg.fg || 'text-white'}`"
      >
        <template v-if="alt">
          <span v-if="size === 'xs'">{{ alt.substring(0, 2) }}</span>
          <span v-else-if="size === 'sm'">{{ alt.substring(0, 2) }}</span>
          <span v-else-if="alt.length > 6">{{ alt.substring(0, 6) + '..' }}</span>
          <span v-else>{{ alt }}</span>
        </template>
      </div>
    </slot>
    <slot name="acc"></slot>
    <span
      class="hidden bg-green-500 bg-red-500 bg-orange-500 bg-amber-500 bg-yellow-500 bg-lime-500 bg-emerald-500 bg-pink-500 bg-cyan-500 bg-blue-500 bg-indigo-500 bg-sky-500 bg-purple-500/30 text-green-500 text-red-500 text-orange-500 text-amber-500 text-yellow-500 text-lime-500 text-emerald-500 text-pink-500 text-cyan-500 text-blue-500 text-indigo-500 text-sky-500 text-white"
    ></span>
  </div>
</template>

<script lang="ts">
import { Component, Prop, Vue, Watch } from 'vue-property-decorator';
import { connector, IAppManager, IApp, AppPreset, Icon } from '@ale-run/connector';

import text2color from '@/components/common/text2color';

@Component
export default class XAppIcon extends Vue {
  @Prop() public icon?: Icon;
  @Prop({ default: '' }) public alt?: string;
  @Prop({ default: 'xl' }) public size?: string;
  @Prop() public shape?: string;
  @Prop() public app?: string;
  @Prop() public preset?: string;

  public appicon: Icon = null;
  public get calcshape(): string {
    return this.shape || this.appicon?.shape || 'circle';
  }

  public get bg() {
    return text2color(this.alt);
  }

  @Watch('icon')
  @Watch('app')
  @Watch('preset')
  public async reload() {
    if (this.icon) {
      this.appicon = this.icon;
    }
    if (!this.appicon && this.preset) {
      const appmgr: IAppManager = connector.getAppManager();
      const preset: AppPreset = await appmgr.getPreset(this.preset);
      const appname = preset?.config && preset?.config[0] && preset?.config[0]?.app;

      if (preset?.icon) {
        this.appicon = preset.icon;
      } else if (appname) {
        const app: IApp = await appmgr.get(appname);
        this.appicon = app?.stat?.icon;
      }
    }
    if (!this.appicon && this.app) {
      const appmgr: IAppManager = connector.getAppManager();
      const app: IApp = await appmgr.get(this.app);
      this.appicon = app?.stat?.icon;
    }
  }

  public async mounted() {
    await this.reload();
  }

  public onClick(e) {
    this.$emit('click', e);
  }
}
</script>
