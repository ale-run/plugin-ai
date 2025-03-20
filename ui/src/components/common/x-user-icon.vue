<template>
  <XAvatar
    :class="{
      'cursor-pointer': user && user.name && user.email
    }"
    :url="user && user.picture"
    :size="size"
    :shape="shape"
    v-tooltip="
      user &&
        user.name &&
        user.email && {
          content: tooltip || `${user && user.name} / ${user && user.email}`,
          delay: { show: 0, hide: 100 },
          offset: 8,
          hideOnTargetClick: false
        }
    "
    @click="onClick"
  />
</template>

<script lang="ts">
import { Component, Prop, Vue, Watch } from 'vue-property-decorator';
import { connector, UserInfo } from '@ale-run/connector';

import XAvatar from '@/components/common/x-avatar.vue';

const cache = {};

@Component({
  components: {
    XAvatar
  }
})
export default class XUserIcon extends Vue {
  @Prop() public uid!: string;
  @Prop() public dataUser!: UserInfo;
  @Prop({ default: 'xs' }) public size?: string;
  @Prop() public shape?: string;
  @Prop() public dataTooltip!: string;

  public user: UserInfo = null;
  public loaded = false;

  public get tooltip(): string {
    if (this.dataTooltip) return this.dataTooltip;

    const user = this.user;
    if (!user?.name && !user?.email) return this.$t('XScopeMember.unknown').toString();
    if (user.email) return `${user.name || 'Unknown'}<br/><span class="text-light">${user.email}</span>`;
    return `${user.name || 'Unknown'}`;
  }

  @Watch('uid')
  public async reload() {
    if (!this.uid && !this.dataUser) {
      this.loaded = false;
      return;
    }

    try {
      const user = this.dataUser || cache[this.uid] || (await connector.getUserInfo(this.uid));

      cache[this.uid] = user;
      this.user = user;
    } catch (err) {
      console.error(err);
      this.$emit('error', err);
    } finally {
      this.loaded = true;
    }
  }

  public mounted() {
    this.reload();
  }

  public onClick(e) {
    this.$emit('click', e);
  }
}
</script>
