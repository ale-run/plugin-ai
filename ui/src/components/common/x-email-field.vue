<template>
  <div>
    <div
      class="x-form-control pl-0 overflow-hidden flex items-center"
      :class="{
        'error': email && errors.has('email'),
        'border-info': email && checkedEmail === email
      }"
    >
      <div
        class="px-4 border-r text-lg transition transition-all duration-200 hidden self-stretch flex items-center"
        :class="{
          'bg-active': !email || !(checkedEmail === email || errors.has('email')),
          'bg-light': !email || !(checkedEmail === email || errors.has('email')),
          'bg-info': email && checkedEmail === email,
          'border-info': email && checkedEmail === email,
          'text-white': email && (checkedEmail === email || errors.has('email')),
          'bg-danger': email && errors.has('email'),
          'border-danger': email && errors.has('email')
        }"
      >
        <IconEnvelope />
      </div>
      <div class="px-4 flex-1">
        <input type="email" :placeholder="`${placeholder || 'Email'}`" class="w-full outline-none x-input font-medium" v-model="email" />
      </div>
      <IconCheckLg class="text-info" v-if="email && checkedEmail === email" />
      <XSpinner size="20px" v-else-if="email && checkingEmail" />
      <IconXLg class="text-danger" v-else-if="email && errors.has('email')" />
    </div>
    <p class="x-form-control-error font-semibold" v-if="email && errors.has('email')">
      {{ errors.getMessage('email') }}
    </p>
  </div>
</template>

<script lang="ts">
import { Component, Vue, Watch, VModel, Prop } from 'vue-property-decorator';
import { connector, RegExps, FormErrors } from '@ale-run/connector';
import XSpinner from '../common/x-spinner.vue';
import IconDashCircle from 'bootstrap-icons/icons/dash-circle.svg';
import IconExclamation from 'bootstrap-icons/icons/exclamation-circle.svg';
import IconCheckLg from 'bootstrap-icons/icons/check-lg.svg';
import IconXLg from 'bootstrap-icons/icons/x-lg.svg';
import IconEnvelope from 'bootstrap-icons/icons/envelope.svg';

@Component({
  components: { XSpinner, IconDashCircle, IconExclamation, IconCheckLg, IconXLg, IconEnvelope }
})
export default class XEmailField extends Vue {
  @VModel({ type: String }) public email!: string;
  @Prop() public placeholder!: string;

  public checkedEmail: string = null;
  public checkingEmail = false;
  public errors: FormErrors = new FormErrors();
  public debounce = null;

  public get isValid(): boolean {
    return this.email?.trim() && typeof this.email === 'string' && this.checkedEmail === this.email;
  }

  public async mounted() {
    this.email = this.email?.trim().toLowerCase() || '';
    this.check();
  }

  @Watch('email')
  public check(): boolean {
    const errors = new FormErrors();
    if (!this.email) {
      errors.push('email', 'Email is required');
    } else if (!RegExps.email.regexp.test(this.email)) {
      errors.push('email', RegExps.email.text);
    } else if (this.email !== this.checkedEmail) {
      this.debounce && clearTimeout(this.debounce);
      this.checkingEmail = true;
      this.debounce = setTimeout(() => {
        this.checkEmail();
      }, 500);
    }

    this.errors = errors;
    return !errors.length;
  }

  public async checkEmail(): Promise<boolean> {
    try {
      this.email = this.email.trim().toLowerCase();

      const email = this.email;
      if (!email || !RegExps.email.regexp.test(email)) return false;
      this.checkingEmail = true;
      const authemgr = connector.getAuthManager();
      if (await authemgr.isEmailAvailable(email)) {
        this.checkedEmail = email;
      } else {
        this.errors.push('email', `Email "${email}" already exists`);
      }
      this.checkingEmail = false;
      return this.checkedEmail === email;
    } catch (err) {
      console.error(err);
      this.$emit('error', err);
      return false;
    } finally {
      this.checkingEmail = false;
      this.$emit('status', {
        validity: this.isValid
      });
    }
  }
}
</script>
