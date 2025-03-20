<template>
  <div class="inline-block text-xs">
    <span class="text-default" v-if="status === 'initial'">
      <span class="x-dot x-dot-default mr-[4px] ring-[3px] ring-slate-500/30 mb-[1px]"></span>
      <span class="font-medium text-default">{{ label || $t('status.initial') }}</span>
      <slot />
    </span>
    <span class="text-default" v-if="status === 'prepare'">
      <span class="x-dot x-dot-default mr-[4px] ring-[3px] ring-slate-500/30 mb-[1px]"></span>
      <span class="font-medium text-default">{{ label || $t('status.prepare') }}</span>
      <slot />
    </span>
    <span class="text-default" v-else-if="status === 'waiting'">
      <span class="x-dot x-dot-default mr-[4px] ring-[3px] ring-slate-500/30 mb-[1px] animate-building"></span>
      <span class="font-medium text-default">{{ label || $t('status.waiting') }}</span>
      <slot />
    </span>
    <span class="text-success" v-else-if="status === 'building'">
      <span class="x-dot x-dot-success mr-[4px] ring-[3px] ring-green-500/30 mb-[1px] animate-building"></span>
      <span class="font-medium text-success">{{ label || $t('status.building') }}</span>
      <slot />
    </span>
    <span class="text-warning" v-else-if="status === 'deploy' || status === 'deploying'">
      <span class="x-dot x-dot-warning mr-[4px] ring-[3px] ring-orange-500/30 mb-[1px] animate-building"></span>
      <span class="font-medium text-warning">{{ label || $t('status.deploy') }}</span>
      <slot />
    </span>
    <span class="text-warning" v-else-if="status === 'creating'">
      <span class="x-dot x-dot-warning mr-[4px] ring-[3px] ring-orange-500/30 mb-[1px] animate-building"></span>
      <span class="font-medium text-warning">{{ label || $t('status.deploy') }}</span>
      <slot />
    </span>
    <span class="text-success" v-else-if="status === 'starting'">
      <span class="x-dot x-dot-success mr-[4px] ring-[3px] ring-green-500/30 mb-[1px] animate-building"></span>
      <span class="font-medium text-success">{{ label || $t('status.starting') }}</span>
      <slot />
    </span>
    <span class="text-primary" v-else-if="status === 'running'">
      <span class="x-dot x-dot-primary mr-[4px] ring-[3px] ring-blue-500/30 mb-[1px]"></span>
      <span class="font-medium text-primary">{{ label || $t('status.running') }}</span>
      <slot />
    </span>
    <span class="text-primary" v-else-if="status === 'complete'">
      <span class="x-dot x-dot-primary mr-[4px] ring-[3px] ring-blue-500/30 mb-[1px]"></span>
      <span class="font-medium text-primary">{{ label || $t('status.complete') }}</span>
      <slot />
    </span>
    <span class="text-primary" v-else-if="status === 'applied'">
      <span class="x-dot x-dot-primary mr-[4px] ring-[3px] ring-blue-500/30 mb-[1px]"></span>
      <span class="font-medium">{{ label || $t('status.applied') }}</span>
      <slot />
    </span>
    <span class="text-muted" v-else-if="status === 'created'">
      <span class="x-dot x-dot-gray mr-[4px] ring-[3px] ring-slate-500/30 mb-[1px]"></span>
      <span class="font-medium text-muted">{{ label || $t('status.created') }}</span>
      <slot />
    </span>
    <span class="text-warning" v-else-if="status === 'stopping'">
      <span class="x-dot x-dot-warning mr-[4px] ring-[3px] ring-orange-500/30 mb-[1px] animate-building"></span>
      <span class="font-medium text-warning">{{ label || $t('status.stopping') }}</span>
      <slot />
    </span>
    <span class="text-danger" v-else-if="status === 'terminating'">
      <span class="x-dot x-dot-danger mr-[4px] ring-[3px] ring-red-500/30 mb-[1px] animate-building"></span>
      <span class="font-medium text-danger">{{ label || $t('status.terminating') }}</span>
      <slot />
    </span>
    <span class="text-danger" v-else-if="status === 'stopped'">
      <span class="x-dot x-dot-danger mr-[4px] ring-[3px] ring-red-500/30 mb-[1px]"></span>
      <span class="font-medium text-danger">{{ label || $t('status.stopped') }}</span>
      <slot />
    </span>
    <span class="text-system" v-else-if="status === 'redeploying'">
      <span class="x-dot x-dot-system mr-[4px] ring-[3px] ring-violet-500/30 mb-[1px] animate-building"></span>
      <span class="font-medium text-system">{{ label || $t('status.redeploying') }}</span>
      <slot />
    </span>
    <span class="text-danger" v-else-if="status === 'error'">
      <span class="x-dot x-dot-danger mr-[4px] ring-[3px] ring-red-500/30 mb-[1px]"></span>
      <span class="font-medium text-danger">{{ label || $t('status.error') }}</span>
      <slot />
    </span>
    <span class="text-danger" v-else-if="status === 'fail'">
      <span class="x-dot x-dot-danger mr-[4px] ring-[3px] ring-red-500/30 mb-[1px]"></span>
      <span class="font-medium text-danger">{{ label || $t('status.fail') }}</span>
      <slot />
    </span>
    <span class="text-muted" v-else-if="status === 'cancelled'">
      <span class="x-dot x-dot-gray mr-[4px] ring-[3px] ring-slate-500/30 mb-[1px]"></span>
      <span class="font-medium text-muted">{{ label || $t('status.cancelled') }}</span>
      <slot />
    </span>
    <span class="text-warning" v-else-if="status === 'notfound'">
      <span class="x-dot x-dot-system mr-[4px] ring-[3px] ring-violet-500/30 mb-[1px]"></span>
      <span class="font-medium text-system">{{ label || $t('status.notfound') }}</span>
      <slot />
    </span>
    <span class="text-system" v-else-if="status === 'timeout'">
      <span class="x-dot x-dot-system mr-[4px] ring-[3px] ring-violet-500/30 mb-[1px]"></span>
      <span class="font-medium text-system">{{ label || $t('status.timeout') }}</span>
      <slot />
    </span>
    <span class="text-system" v-else-if="status === 'collecting'">
      <span class="x-dot x-dot-system mr-[4px] ring-[3px] ring-violet-500/30 mb-[1px]"></span>
      <span class="font-medium text-system">{{ label || $t('status.collecting') }}</span>
      <slot />
    </span>
    <span class="text-muted" v-else-if="status === 'unknown'">
      <span class="x-dot x-dot-gray mr-[4px] ring-[3px] ring-slate-500/30 mb-[1px]"></span>
      <span class="font-medium text-muted">{{ label || $t('status.unknown') }}</span>
      <slot />
    </span>
    <span class="text-default" v-else>
      <span class="x-dot x-dot-default mr-[4px] ring-[3px] ring-slate-500/30 mb-[1px]"></span>
      <span class="font-medium text-default">{{ label || status || 'Unknown' }}</span>
      <slot />
    </span>
  </div>
</template>

<script lang="ts">
import { Component, Prop, Vue } from 'vue-property-decorator';

@Component
export default class XStatus extends Vue {
  @Prop() public status?: string;
  @Prop() public label?: string;
}
</script>
