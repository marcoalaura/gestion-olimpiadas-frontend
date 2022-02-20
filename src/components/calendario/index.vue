<template>
  <v-card elevation="0" class="pt-1">
    <v-card v-if="olimpiada && etapa" style="margin-top: -20px" elevation="0">
        <v-row>
          <v-col cols="12" xs="12" sm="12" md="5" lg="5" v-if="estado === ESTADO_CONFIGURACION_COMPETENCIA">
            <v-card elevation="0" class="d-flex flex-column align-center justify-center">
              <v-form lazy-validation ref="form" @submit.prevent="save">
                <v-card-text>
                  <v-card elevation="0">
                      <v-row>
                        <v-col cols="12" xs="12" sm="12" md="6" lg="6">
                          <v-input-select
                            @value="e => mTipoExamen = e"
                            label="Tipo de prueba"
                            :items="aTiposDeExamen"
                            :init="mTipoExamen"
                            v-model="mTipoExamen"
                            :disabled="disabledTipoYFase"
                            dense
                            :rules="[(val) => !!val || 'Tiene que indicar el tipo de examen']"
                          ></v-input-select>
                        </v-col>
                        <v-col cols="12" xs="12" sm="12" md="6" lg="6">
                          <v-input-select
                            @value="e => mFaseOlimpiada = e"
                            label="Fase de la olimpiada"
                            :init="mFaseOlimpiada"
                            :disabled="disabledTipoYFase"
                            :items="aTiposPlanificacion"
                            dense
                            v-model="mFaseOlimpiada"
                            :rules="[(val) => !!val || 'Tiene que indicar el fase de la olimpiada']"
                          ></v-input-select>
                        </v-col>
                        <v-col cols="12" xs="12" sm="12" md="6" lg="6">
                          <date-input
                              :fecha.sync="startDate"
                              :tabIndex="3"
                              label='Fecha de Inicio'
                              :min-date="minDate || undefined"
                              :max-date="maxDateStart || maxDate || undefined"
                              required
                              formatValidate="DD-MM-YYYY"
                              :disabled="disabledFechasYHoras"
                              @value="fechaInicio"
                          ></date-input>
                        </v-col>
                        <v-col cols="12" xs="12" sm="12" md="6" lg="6">
                          <v-row no-gutters>
                            <v-col cols="3">
                              <v-text-field
                                label="Hora"
                                maxlength="2"
                                v-model="mStartHour"
                                class="mask--hour"
                                @keyup="(e) => mask(e, 'mStartHour')"
                                @blur="numberValidate('mStartHour')"
                                :rules="[(val) => !!val || '']"
                                :disabled="disabledFechasYHoras"
                                tabindex="4"
                                dense
                              ></v-text-field>
                            </v-col>
                            <v-col cols="1" class="ml-2">:</v-col>
                            <v-col cols="3">
                              <v-text-field
                                label="Minuto"
                                class="mask--hour"
                                maxlength="2"
                                v-model="mStartHourMinute"
                                @keyup="(e) => mask(e, 'mStartHourMinute')"
                                @blur="numberValidate('mStartHourMinute')"
                                :rules="[(val) => !!val || '']"
                                :disabled="disabledFechasYHoras"
                                tabindex="5"
                                dense
                              ></v-text-field>
                            </v-col>
                            <v-col cols="1" class="ml-2">:</v-col>
                            <v-col cols="3">
                              <v-text-field
                                label="Segundo"
                                maxlength="2"
                                class="mask--hour"
                                :disabled="disabledFechasYHoras"
                                v-model="mStartHourSecond"
                                @keyup="(e) => mask(e, 'mStartHourSecond')"
                                @blur="numberValidate('mStartHourSecond')"
                                :rules="[(val) => !!val || '']"
                                tabindex="6"
                                dense
                              ></v-text-field>
                            </v-col>
                          </v-row>
                        </v-col>
                        <v-col cols="12" xs="12" sm="12" md="6" lg="6">
                          <date-input
                            :fecha.sync="endDate"
                            :tabIndex="7"
                            label='Fecha de culminación'
                            :min-date="minDateEnd || undefined"
                            :disabled="disabledFechasYHoras"
                            :max-date="maxDate || undefined"
                            required
                            formatValidate="DD-MM-YYYY"
                            @value="fechaFin"
                          ></date-input>
                        </v-col>
                        <v-col cols="12" xs="12" sm="12" md="6" lg="6">
                          <v-row no-gutters>
                            <v-col cols="3">
                              <v-text-field
                                label="Hora"
                                maxlength="2"
                                class="mask--hour"
                                :disabled="disabledFechasYHoras"
                                v-model="mEndHour"
                                @keyup="(e) => mask(e, 'mEndHour')"
                                @blur="numberValidate('mEndHour')"
                                :rules="[(val) => !!val || '']"
                                dense
                                tabindex="8"
                              ></v-text-field>
                            </v-col>
                            <v-col cols="1" class="ml-2">:</v-col>
                            <v-col cols="3">
                              <v-text-field
                                label="Minuto"
                                class="mask--hour"
                                maxlength="2"
                                v-model="mEndHourMinute"
                                :disabled="disabledFechasYHoras"
                                @keyup="(e) => mask(e, 'mEndHourMinute')"
                                @blur="numberValidate('mEndHourMinute')"
                                :rules="[(val) => !!val || '']"
                                tabindex="9"
                                dense
                              ></v-text-field>
                            </v-col>
                            <v-col cols="1" class="ml-2">:</v-col>
                            <v-col cols="3">
                              <v-text-field
                                label="Segundo"
                                maxlength="2"
                                class="mask--hour"
                                v-model="mEndHourSecond"
                                :disabled="disabledFechasYHoras"
                                @keyup="(e) => mask(e, 'mEndHourSecond')"
                                @blur="numberValidate('mEndHourSecond')"
                                :rules="[(val) => !!val || '']"
                                tabindex="10"
                                dense
                              ></v-text-field>
                            </v-col>
                          </v-row>
                        </v-col>
                      </v-row>
                  </v-card>
                </v-card-text>
              <v-card-actions class="ma-0">
                <v-row>
                  <v-col cols="12" v-if="isEdit">
                    <v-btn v-if="estado !== this.ESTADO_HABILITACION_REZAGADOS" :color="$vuetify.theme.dark ? 'warning' : 'error'" block outlined @click="removeItem" class="fs8">
                      <v-icon-component icon="event_busy"></v-icon-component>
                      Eliminar hora asignada
                    </v-btn>
                  </v-col>
                  <v-col cols="12" xs="12" sm="12" md="6" lg="6">
                    <v-btn :color="$vuetify.theme.dark ? 'warning' : 'error'" block outlined @click="reset" class="fs8" :disabled="estado === this.ESTADO_HABILITACION_REZAGADOS">
                      Limpiar campos
                    </v-btn>
                  </v-col>
                  <v-col cols="12" xs="12" sm="12" md="6" lg="6">
                    <v-btn color="primary" :loading="loading" block type="submit" class="fs8" outlined :disabled="loading || disabledFechasYHoras || (estado === this.ESTADO_HABILITACION_REZAGADOS && !isEdit)">
                      {{ isEdit ? 'Actualizar registro' : 'Crear calendario' }}
                    </v-btn>
                  </v-col>
                </v-row>
              </v-card-actions>
          </v-form>
        </v-card>
          </v-col>
          <v-col
            cols="12"
            xs="12"
            sm="12"
            :md="estado === ESTADO_CONFIGURACION_COMPETENCIA ? 7 : 12"
            :lg="estado === ESTADO_CONFIGURACION_COMPETENCIA ? 7 : 12">
            <v-card elevation="0" class="fs12 d-flex flex-row align-center justify-center w100">
              <v-btn
                icon
                @click="$refs[reference].prev(); setDisabledDates(); getDataCalendar()"
              >
                <v-icon>{{ ICONS.chevron_left }}</v-icon>
              </v-btn>
              <div class="d-flex flex-row align-center justify-center" style="text-align: center">Vista del {{ sFirstDate }} al {{ sLastDate }}</div>
              <v-btn
                icon
                @click="$refs[reference].next(); setDisabledDates(); getDataCalendar()"
              >
                <v-icon>{{ ICONS.chevron_right }}</v-icon>
              </v-btn>
            </v-card>
            <v-card elevation="0">
              <v-calendar
                locale="es-ES"
                :ref="reference"
                class="mt-2 o--calendar"
                v-if="readyCalendar"
                v-model="calendar"
                :weekdays="[1, 2, 3, 4, 5, 6, 0]"
                type="month"
                :events="events"
                event-overlap-mode="stack"
                @click:event="showEvent"
                @click:more="handleClickMore"
                :event-overlap-threshold="30"
                :event-color="getEventColor"
                :short-weekdays="false"
                :short-months="false"
              >
                <template v-slot:day="{ past, date }">
                  <span :class="isValidDate(date, past) ? 'enabled--calendar_day alldays' : 'disabled--calendar_day alldays'">
                    <span :id="date"></span>
                  </span>
                </template>
              </v-calendar>
            </v-card>
          </v-col>
        </v-row>
    </v-card>
  </v-card>
</template>
<script>
import vIconComponent from '@/plugins/icon/index.vue';
import DateInput from '@/plugins/date-input/DateInput.vue';

export default {
  props: {
    olimpiada: {
      type: String,
      default: null
    },
    etapa: {
      type: Object,
      default: () => {}
    },
    etapaAreaGrado: {
      type: Object,
      default: () => {}
    },
    estado: {
      type: String,
      default: ''
    },
    ESTADO_CONFIGURACION_COMPETENCIA: {
      type: String
    },
    reference: {
      type: String,
      default: null
    }
  },
  data: () => ({
    aOlimpiadas: [],
    mFaseOlimpiada: null,
    aEtapas: [],
    aAreas: [],
    aTiposPlanificacion: ['CRONOGRAMA', 'REZAGADO'],
    aTiposDeExamen: ['ONLINE', 'OFFLINE'],
    area: null,
    mEtapa: null,
    dialog: false,
    minDate: null,
    maxDate: null,
    minDateEnd: null,
    maxDateStart: null,
    correctEndDate: false,
    correctTest: false,
    selectedElement: null,
    loading: false,
    selectedOpen: null,
    selectedEvent: {},
    hours: false,
    startMenuDatepicker: null,
    endMenuDatepicker: null,
    mTipoExamen: null,
    dateRange: [],
    backupInitDate: null,
    mStartHour: null,
    mStartHourMinute: null,
    mStartHourSecond: null,
    mEndHour: null,
    mEndHourMinute: null,
    mEndHourSecond: null,
    editModal: null,
    startDate: null,
    endDate: null,
    disabledDatePicker: true,
    weekday: [0, 1, 2, 3, 4, 5, 6],
    calendar: '',
    events: [],
    idHoraAsignada: null,
    correctInitHour: null,
    readyCalendar: null,
    mesSeleccionado: null,
    firstDate: null,
    sFirstDate: null,
    lastDate: null,
    sLastDate: null,
    dateSelected: null,
    isEdit: false,
    disabledTipoYFase: false,
    disabledFechasYHoras: false,
    ESTADO_HABILITACION_REZAGADOS: 'HABILITACION_REZAGADOS'
  }),
  components: {
    vIconComponent,
    DateInput
  },
  watch: {
    calendar () {
      this.setDisabledDates();
    },
    startDate (val) {
      if (val) {
        this.minDateEnd = this.$datetime.transformFormat(val, 'DD-MM-YYYY', 'YYYY-MM-DD');
      }
    },
    endDate (val) {
      if (val) {
        this.maxDateStart = this.$datetime.transformFormat(val, 'DD-MM-YYYY', 'YYYY-MM-DD');
      }
    },
    mTipoExamen () {
      if (this.mTipoExamen === 'OFFLINE' && this.estado !== this.ESTADO_HABILITACION_REZAGADOS) {
        this.aTiposPlanificacion = ['CRONOGRAMA'];
      } else {
        this.aTiposPlanificacion = ['CRONOGRAMA', 'REZAGADO'];
      }
    }
  },
  methods: {
    handleClickMore () {
      this.readyCalendar = false;
      setTimeout(() => {
        this.readyCalendar = true;
      }, 10);
    },
    goToInit () {
      this.calendar = this.etapa.fechaInicio;
    },
    mask ({ key, keyCode }, field) {
      const keys = [8, 37, 38, 39, 40];
      if (isNaN(key) && !keys.includes(keyCode)) {
        this[field] = this[field] ? this[field].substr(0, this[field].length - 1) : null;
      }
    },
    numberValidate (field) {
      if (this[field] && this[field].length === 1) this[field] = `0${this[field]}`;
      if (['mStartHour', 'mEndHour'].includes(field) && !((parseInt(this[field]) >= 0) && parseInt(this[field]) < 24 && (this[field]).toString().length === 2)) this[field] = null;
      if (['mStartHourMinute', 'mEndHourMinute'].includes(field) && !((parseInt(this[field]) >= 0) && parseInt(this[field]) < 60 && (this[field]).toString().length === 2)) this[field] = null;
      if (['mStartHourSecond', 'mEndHourSecond'].includes(field) && !((parseInt(this[field]) >= 0) && parseInt(this[field]) < 60 && (this[field]).toString().length === 2)) this[field] = null;
    },
    fechaInicio (val) {
      this.startDate = val;
    },
    fechaFin (val) {
      this.endDate = val;
    },
    editItem () {
      if (this.estado === this.ESTADO_HABILITACION_REZAGADOS
        && (this.selectedEvent?.tipoPlanificacion === 'CRONOGRAMA' || this.selectedEvent?.tipoPrueba === 'OFFLINE')) {
        this.$message.warning('Solo se puede editar cronogramas ONLINE para REZAGADOS');
        this.disabledFechasYHoras = true;
        this.disabledTipoYFase = true;
      }
      this.isEdit = true;
      const startDate = new Date(this.selectedEvent.fechaHoraInicio);
      const endDate = new Date(this.selectedEvent.fechaHoraFin);
      this.idHoraAsignada = this.selectedEvent.id;
      this.mTipoExamen = this.selectedEvent.tipoPrueba;
      this.mFaseOlimpiada = this.selectedEvent.tipoPlanificacion;
      this.startDate = this.$datetime.format('DD-MM-YYYY', startDate);
      this.endDate = this.$datetime.format('DD-MM-YYYY', endDate);
      this.mStartHour = this.$datetime.getHour(startDate);
      this.mStartHourMinute = this.$datetime.getMinutes(startDate);
      this.mStartHourSecond = this.$datetime.getSeconds(startDate);
      this.mEndHour = this.$datetime.getHour(endDate);
      this.mEndHourMinute = this.$datetime.getMinutes(endDate);
      this.mEndHourSecond = this.$datetime.getSeconds(endDate);
    },
    formatDate (date) {
      if (!date) return null;
      const [year, month, day] = date ? date.split('-') : '';
      return `${day}/${month}/${year}`;
    },
    parseDate (date) {
      if (!date) return null;
      const [day, month, year] = date ? date.split('/') : '';
      return `${year}-${month.padStart(2, '0')}-${day.padStart(2, '0')}`;
    },
    saveEndHour () {
      if (this.mEndHour && this.mEndHourMinute && this.mEndHourSecond) {
        this.correctEndDate = true;
        this.correctTest = true;
      } else {
        this.$message.error('La hora ingresada no esta en el formato correcto');
      }
    },
    saveStartHour () {
      if (this.mStartHour && this.mStartHourMinute && this.mStartHourSecond) {
        this.correctInitHour = true;
        this.disabledDatePicker = false;
        const [initDate] = this.dateRange;
        this.minDate = initDate;
        this.backupInitDate = initDate;
      } else {
        this.$message.error('La hora ingresada no esta en el formato correcto');
      }
    },
    isValidDate (date) {
      const statDate = new Date(this.mEtapa.fechaInicioMilis);
      const endDate = new Date(this.mEtapa.fechaFinMilis);
      return this.$datetime.between(date, statDate, endDate);
    },
    removeItem () {
      this.$confirm(`¿Esta seguro de eliminar la asignación de ${this.selectedEvent.name} planificada para las ${this.$datetime.getTime(new Date(this.selectedEvent.fechaHoraInicio))}?`, async () => {
        try {
          const response = await this.$service.delete(`calendarios/${this.selectedEvent.id}`);
          if (response && response.hasOwnProperty('codigo')) {
            if ([403, 404, 401].includes(response.codigo)) {
              throw new Error(response.mensaje);
            } else {
              this.$message.success('Asignacion de la hora exitosamente eliminado');
              this.getAreas();
              this.reset();
            }
          } else {
            this.$message.success('Asignacion de la hora exitosamente eliminado');
            this.getAreas();
            this.reset();
          }
        } catch (error) {
          this.$store.commit('closeModal', 3);
          this.$message.error(error.message || error.mensaje);
        }
      }, () => {}, 'SI, ESTOY SEGURO', 'NO');
    },
    reset () {
      this.isEdit = null;
      this.dateRange = [];
      this.startDate = null;
      this.mStartHour = null;
      this.mStartHourMinute = null;
      this.mStartHourSecond = null;
      this.endDate = null;
      this.mEndHour = null;
      this.mEndHourMinute = null;
      this.mEndHourSecond = null;
      this.correctTest = null;
      this.correctInitHour = null;
      this.correctEndDate = null;
      this.idHoraAsignada = null;
      this.area = null;
      this.maxDateStart = null;
      this.minDateEnd = null;
      if (this.estado !== this.ESTADO_HABILITACION_REZAGADOS) {
        this.mFaseOlimpiada = null;
        this.mTipoExamen = null;
      }
    },
    save () {
      try {
        if (this.isEdit) {
          if (this.$refs.form.validate()) {
            this.loading = true;
            if (!(this.mStartHour && this.mStartHourMinute && this.mStartHourSecond)) {
              this.$message.error('La hora ingresada no esta en el formato correcto');
              this.loading = false;
              return;
            }
            if (!(this.mEndHour && this.mEndHourMinute && this.mEndHourSecond)) {
              this.$message.error('La hora ingresada no esta en el formato correcto');
              this.loading = false;
              return;
            }
            this.$confirm(`¿Esta seguro de actualizar el registro de ${this.selectedEvent.name}?`, async () => {
              const fechaInicioEnviar = this.$datetime.transformFormat(this.startDate, 'DD-MM-YYYY', 'YYYY-MM-DD');
              const fechaFinEnviar = this.$datetime.transformFormat(this.endDate, 'DD-MM-YYYY', 'YYYY-MM-DD');
              const obj = {
                tipoPrueba: this.mTipoExamen,
                tipoPlanificacion: this.mFaseOlimpiada,
                fechaHoraInicio: `${fechaInicioEnviar} ${this.mStartHour}:${this.mStartHourMinute}:${this.mStartHourSecond}`,
                fechaHoraFin: `${fechaFinEnviar} ${this.mEndHour}:${this.mEndHourMinute}:${this.mEndHourSecond}`
              };
              const response = await this.$service.put(`calendarios/${this.idHoraAsignada}`, obj);
              if (response && response.isOK) {
                this.readyCalendar = false;
                setTimeout(async () => {
                  this.$message.success(response.mensaje || 'Registro actualizado satisfactoriamente');
                  await this.getStages();
                  this.readyCalendar = !this.readyCalendar;
                  this.getAreas();
                  this.reset();
                  this.loading = false;
                  if (this.estado === this.ESTADO_HABILITACION_REZAGADOS) {
                    this.disabledFechasYHoras = true;
                  }
                }, 10);
              }
            }, () => {
              this.loading = false;
            });
          } else {
            this.loading = false;
            this.$message.error('Faltan campos que llenar');
          }
        } else {
          if (this.$refs.form.validate()) {
            this.loading = true;
            this.$confirm('¿Está seguro de crear el registro?', async () => {
              const fechaInicioEnviar = this.$datetime.transformFormat(this.startDate, 'DD-MM-YYYY', 'YYYY-MM-DD');
              const fechaFinEnviar = this.$datetime.transformFormat(this.endDate, 'DD-MM-YYYY', 'YYYY-MM-DD');
              const obj = {
                tipoPrueba: this.mTipoExamen,
                tipoPlanificacion: this.mFaseOlimpiada,
                fechaHoraInicio: `${fechaInicioEnviar} ${this.mStartHour}:${this.mStartHourMinute}:${this.mStartHourSecond}`,
                fechaHoraFin: `${fechaFinEnviar} ${this.mEndHour}:${this.mEndHourMinute}:${this.mEndHourSecond}`
              };
              if (!this.mTipoExamen) {
                this.$message.error('Le falta seleccionar el tipo de examen');
                this.loading = false;
                return;
              }
              if (!this.mFaseOlimpiada) {
                this.$message.error('Le falta seleccionar la fase de la olimpiada');
                this.loading = false;
                return;
              }
              const response = await this.$service.post(`etapasAreaGrado/${this.etapaAreaGrado.id}/calendarios`, obj);
              if (response && response.isOK) {
                this.readyCalendar = false;
                this.$message.success('Hora del examen exitosamente creado');
                setTimeout(async () => {
                  this.readyCalendar = !this.readyCalendar;
                  await this.getStages();
                  this.getAreas();
                  this.reset();
                  this.loading = false;
                }, 10);
              } else {
                this.correctInitHour = false;
                this.correctEndDate = false;
                this.correctTest = false;
                this.readyCalendar = true;
                this.loading = false;
              }
            }, () => {
              this.loading = false;
            });
          } else {
            this.loading = false;
            this.$message.error('Faltan campos que llenar');
          }
        }
      } catch (error) {
        this.correctInitHour = false;
        this.correctEndDate = false;
        this.correctTest = false;
        this.readyCalendar = true;
        this.loading = false;
        this.$message.error(error.message || error.mensaje);
      }
    },
    // eslint-disable-next-line no-unused-vars
    showEvent ({ nativeEvent, event }) {
      this.isEdit = true;
      this.selectedEvent = event;
      this.disabledFechasYHoras = false;
      this.editItem();
    },
    setDisabledDates () {
      setTimeout(() => {
        const CLASSNAME_ALLDAYS = 'alldays';
        const CLASSNAME_DISABLED = 'disabled--calendar_day';
        const CLASSNAME_ENABLED = 'enabled--calendar_day';
        const SET_CLASSNAME_DISABLED = 'disabled--dc';
        const SET_CLASSNAME_ENABLED = 'enabled--dc';
        const disabledDays = document.getElementsByClassName(CLASSNAME_DISABLED);
        const enabledDays = document.getElementsByClassName(CLASSNAME_ENABLED);
        const allDays = document.getElementsByClassName(CLASSNAME_ALLDAYS);
        this.firstDate = allDays && allDays.length > 0 ? allDays[0].children[0].getAttribute('id') : '';
        this.lastDate = allDays && allDays.length > 0 ? allDays[allDays.length - 1].children[0].getAttribute('id') : '';
        allDays.forEach(item => item.parentElement.classList.remove(SET_CLASSNAME_DISABLED, SET_CLASSNAME_ENABLED));
        disabledDays.forEach(item => item.parentElement.classList.add(SET_CLASSNAME_DISABLED));
        enabledDays.forEach(item => item.parentElement.classList.add(SET_CLASSNAME_ENABLED));
      }, 100);
    },
    getStages () {
      return new Promise(async (resolve, reject) => {
        try {
          const aEtapas = await this.$service.get(`olimpiadas/${this.olimpiada}/etapas`);
          this.aEtapas = aEtapas.datos.filas;
          this.mEtapa = this.aEtapas.find(etapa => etapa.id === this.$storage.get('etapaSeleccionada').id);
          resolve(true);
        } catch (error) {
          reject(error.message);
        }
      });
    },
    getDataCalendar () {
      const { calendar } = this.$refs;
      this.mesSeleccionado = calendar?.title;
      setTimeout(() => {
        this.sFirstDate = this.$datetime.getDayAndMonth(this.firstDate);
        this.sLastDate = this.$datetime.getDayAndMonth(this.lastDate);
      }, 110);
    },
    async getAreas () {
      this.readyCalendar = true;
      const minDate = new Date(this.mEtapa.fechaInicioMilis);
      const maxDate = new Date(this.mEtapa.fechaFinMilis);
      this.minDate = this.$datetime.format('YYYY-MM-DD', minDate);
      this.maxDate = this.$datetime.format('YYYY-MM-DD', maxDate);
      const aAreas = await this.$service.get(`etapas/${this.mEtapa.id}/etapaAreaGrados`);
      if (aAreas) {
        this.aAreas = aAreas.datos.filas.map(itemArea => {
          const obj = { ...itemArea };
          obj.nombre = `${itemArea.area.nombre} - ${itemArea.gradoEscolar.nombre}`;
          return obj;
        });
      }
      const events = await this.$service.get(`etapas/${this.mEtapa.id}/calendarios`);
      const aEvents = events.datos.filas.map(evt => {
        const objEvent = { ...evt };
        const findArea = this.aAreas.find(item => item.id === evt.etapaAreaGrado.id);
        objEvent.name = findArea ? `${findArea.area.nombre} - ${findArea.gradoEscolar.nombre}` : '';
        objEvent.start = new Date(evt.fechaHoraInicio);
        objEvent.end = new Date(evt.fechaHoraFin);
        objEvent.color = evt.etapaAreaGrado.color;
        // objEvent.timed = true;
        objEvent.id = evt.id;
        return objEvent;
      });
      const groupEvents = aEvents.reduce((container, item) => {
        container[item.color] = [...container[item.color] || [], item];
        return container;
      }, {});
      let finalEvents = [];
      (Object.keys(groupEvents) || []).forEach(item => finalEvents = [...finalEvents, ...groupEvents[item]]);
      this.events = finalEvents;
      this.setDisabledDates();
      this.getDataCalendar();
    },
    getEventColor (event) {
      return event.color;
    },
    rnd (a, b) {
      return Math.floor((b - a + 1) * Math.random()) + a;
    }
  },
  mounted () {
    this.$nextTick(async () => {
      await this.getStages();
      this.getAreas();
      if (this.estado === this.ESTADO_HABILITACION_REZAGADOS) {
        this.disabledTipoYFase = true;
        this.disabledFechasYHoras = true;
      } else {
        this.aTiposDeExamen = ['ONLINE', 'OFFLINE'];
      }
      this.calendar = this.etapa.fechaInicio;
    });
  }
};
</script>
<style lang="scss">
@import '../../scss/variables.scss';

.calendar-information {
  .v-toolbar__content {
    padding: 0 !important;
  }
}

.dias-habilitacion {
  .v-picker__title {
    display: none;
  }
}
.o--calendar {
  .v-event:hover {
    overflow: visible;
    min-width: fit-content !important;
  }
}
.theme--light .disabled--dc {
  background-color: #fcebeb !important;
  transition: all 0.5s;
  button,
  .v-calendar-weekly__day-label {
    cursor: not-allowed !important;
  }
}
.theme--dark .disabled--dc {
  background-color: #f0c1c1 !important;
  transition: all 0.5s;
  button,
  .v-calendar-weekly__day-label {
    cursor: not-allowed !important;
  }
  .v-btn__content {
    color: #000 !important;
  }
}
.enabled--dc {
  background-color: transparent !important;
  transition: all 0.5s;
}
.mask--hour {
  input {
    text-align: center;
  }
}
</style>
