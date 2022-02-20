<template>
  <v-menu
    ref="menu"
    v-model="menu"
    :close-on-content-click="false"
    transition="scale-transition"
    offset-y
    min-width="auto"
  >
    <template v-slot:activator="{ on, attrs }">
      <v-text-field
        color="primary"
        v-model="formFecha"
        :disabled="disabled"
        :label="label"
        :prepend-icon="ICONS.date_range"
        v-bind="attrs"
        v-on="on"
        outlined
        dense
        autocomplete="off"
        hint="DD-MM-AAAA"
        maxlength="10"
        persistent-hint
        :tabindex="tabIndex"
        :rules="
          !disabled
            ? required
              ? rules.required.concat(rules.validated)
              : rules.validated
            : []
        "
        @blur="dateNac = parseDate(formFecha, 'DD-MM-YYYY', 'YYYY-MM-DD')"
        clearable
      ></v-text-field>
    </template>
    <v-date-picker
      ref="picker"
      color="primary"
      :disabled="disabled"
      v-model="dateNac"
      :max="maxDate"
      :min="minDate"
      @change="menu = false"
      no-title
      locale="es"
      scrollable
      :show-current="getCurrentDate()"
    />
  </v-menu>
</template>
<script>
/* eslint-disable */
import moment from 'dayjs';

const customParseFormat = require('dayjs/plugin/customParseFormat');

moment.extend(customParseFormat);

export default {
  props: {
    label: {
      type: String,
      default: null,
    },
    fecha: {
      type: String,
      default: null,
    },
    disabled: {
      type: Boolean,
      default: false,
    },
    required: {
      type: Boolean,
      default: false,
    },
    // fecha mínima en formato YYYY-MM-DD
    minDate: {
      type: String,
      default: undefined,
    },
    // fecha máxima en formato YYYY-MM-DD
    maxDate: {
      type: String,
      default: new Date().toISOString().substr(0, 10),
    },
    tabIndex: {
      type: Number,
    },
    formatValidate: {
      type: String,
      default: null
    },
  },
  data() {
    return {
      menu: false,
      formFecha: null,
      dateNac: null,
      rules: {
        required: [v => !!v || 'Este campo es requerido.'],
        validated: [
          v => this.validDate(v) || 'La fecha introducida no es válida',
          v => this.parseRange(v) || 'La fecha no está en el rango permitido',
          v => this.checkValidFormat(v) || 'El formato de fecha debe ser ' + this.formatValidate.replace('YYYY', 'AAAA'),
        ],
      },
    };
  },
  watch: {
  //   formFecha() {
  //     this.$emit('value', this.formFecha);
  //     this.dateNac = this.parseDate(this.formFecha, 'YYYY-MM-DD', 'DD-MM-YYYY')
  //     console.log('this.formFecha watch', this.formFecha);
  //   },
    dateNac(val) {
      const mDate = moment(val, 'YYYY-MM-DD', 'es');
      this.formFecha = mDate.isValid() ? mDate.format('DD-MM-YYYY') : '';
      this.$emit('value', this.formFecha);
    },
    fecha(val){
      this.formFecha = this.parseDate(val, 'YYYY-MM-DD', 'DD-MM-YYYY');
    }
  },
  mounted() {
    this.formFecha = this.parseDate(this.fecha, 'YYYY-MM-DD', 'DD-MM-YYYY');
  },
  methods: {
    validDate(cFecha) {
      if (cFecha) return moment(cFecha, 'DD-MM-YYYY', 'es').isValid();
      return !this.required;
    },
    checkValidFormat(cFecha) {
      if (!cFecha || !this.formatValidate)
      return true
      const mDate = moment(cFecha, this.formatValidate);
      return mDate.format(this.formatValidate) === cFecha
    },
    parseRange(cFecha) {
      if (moment(cFecha, 'DD-MM-YYYY', 'es').isValid()) {
        const mDate = moment(cFecha, 'DD-MM-YYYY', 'es');
        const maxAllowed = moment(this.maxDate);
        const minAllowed = this.minDate
          ? moment(this.minDate)
          : moment().subtract(200, 'y');
        return minAllowed <= mDate && mDate <= maxAllowed;
      }
      return !this.required;
    },
    parseDate(dateOriginal, formato, formatoNuevo) {
      if (moment(dateOriginal, formato, 'es').isValid()) {
        return moment(dateOriginal, formato).format(formatoNuevo);
      } else {
        return dateOriginal;
      }
    },
    getCurrentDate() {
      const now = moment();
      const maxAllowed = moment(this.maxDate);
      return now < maxAllowed ? now.format('YYYY-MM-DD') : this.maxDate;
    },
  },
};
</script>
