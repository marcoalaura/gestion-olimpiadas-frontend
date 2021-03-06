<template>
  <v-card elevation="0">
    <app-dialog
      :dialog.sync="modalOlimpiada"
      :titulo="form.id ? 'Editar Olimpiada' : 'Adicionar Olimpiada'"
      @open-dialog="modalOlimpiada = true"
      @close-dialog="modalOlimpiada = false"
      @accion="save"
      max-width="675px"
    >
      <!-- SLOT PARA EL FORMULARIO -->
      <template v-if="modalOlimpiada">
        <!-- FORMULARIO PARA AGREGAR O EDITAR -->
        <v-form
          :key="`olimpiada-${form.id}`"
          ref="form"
          v-model="valid"
          lazy-validation
          @submit.prevent="save"
        >
          <v-card elevation="0">
            <v-container fluid>
              <v-card elevation="0" class="primary--text mb-3"
                >Datos del olimpiada
              </v-card>
              <v-row>
                <v-col cols="12" md="12" xs="12" sm="12" lg="12">
                  <v-input-text-field
                      autofocus
                      @value="e => form.nombre = e"
                      :init="form.nombre"
                      v-model="form.nombre"
                      label="Nombre de Olimpiada"
                      required
                      full-width
                      :clearable="false"
                      dense
                      maxlength="255"
                      :tabIndex="1"
                      :rules="$validate(['required', 'alfanumerico'])"
                  />
                </v-col>
                <v-col cols="12" md="12" xs="12" sm="12" lg="12">
                  <v-input-text-field
                      @value="e => form.sigla = e"
                      :init="form.sigla"
                      v-model="form.sigla"
                      label="Sigla"
                      required
                      full-width
                      :clearable="false"
                      dense
                      maxlength="30"
                      :rules="$validate(['required', 'alfanumerico'])"
                      :tabIndex="2"
                  />
                </v-col>
                <v-col cols="12" md="12" xs="12" sm="12" lg="12">
                  <v-input-autocomplete
                    @value="e => form.gestion = e"
                    key="distritos"
                    item-color="primary"
                    v-model="form.gestion"
                    :init="form.gestion"
                    label='Gestión'
                    :items="[2020, 2021, 2022, 2023, 2024, 2025, 2026, 2027, 2028, 2029, 2030]"
                    dense
                    :rules="$validate(['required'])"
                    outlined
                    hide-details
                    :append-icon="ICONS.arrow_drop_down"
                    :values="[2020, 2021, 2022, 2023, 2024, 2025, 2026, 2027, 2028, 2029, 2030]"
                  ></v-input-autocomplete>
                </v-col>
                <v-col cols="12" lg="6" md="6" sm="12" xs="12" v-if="modalOlimpiada">
                  <v-input-text-field
                      class = "display-inline"
                      :class="this.compararFechas(form.fechaInicio, form.fechaFin) ? 'date-required' : ''"
                      label="Fecha inicio"
                      :tabIndex="4"
                  >
                    <template slot="contenido">
                      <date-input
                          :fecha.sync="form.fechaInicio"
                          :disabled="!gestionValida || !form.gestion"
                          :min-date.sync="minFechaInicio"
                          :max-date=this.ultimoDiaGestion(this.form.gestion)
                          required
                          @value="obtenerFechaInicial"
                      ></date-input>
                    </template>
                  </v-input-text-field>
                </v-col>
                <v-col cols="12" lg="6" md="6" sm="12" xs="12" v-if="modalOlimpiada">
                  <v-input-text-field
                      class = "display-inline"
                      :class="this.compararFechas(form.fechaInicio, form.fechaFin) ? 'date-required' : ''"
                      label="Fecha fin"
                      :tabIndex="5"
                  >
                    <template slot="contenido">
                      <date-input
                          :fecha.sync="form.fechaFin"
                          :disabled="!gestionValida || !form.gestion"
                          :max-date.sync="maxFechaFin"
                          :min-date="this.formatFechaValidar(minFechaFin, 'DD-MM-YYYY', 'YYYY-MM-DD')"
                          required
                          @value="obtenerFechaFinal"
                      ></date-input>
                    </template>
                  </v-input-text-field>
                </v-col>
                <v-col cols="12" md="12" xs="12" sm="12" lg="12">
                  <v-input-text-field
                      @value="e => form.leyenda = e"
                      :init="form.leyenda"
                      v-model="form.leyenda"
                      label="Leyenda"
                      required
                      full-width
                      :clearable="false"
                      dense
                      maxlength="255"
                      :tabIndex="1"
                      :rules="$validate(['required', 'alfanumerico'])"
                  />
                </v-col>
                <v-col cols="12" md="12" xs="12" sm="12" lg="12">
                  <div class="helper"></div>
                    <div class="drop display-inline align-center"
                         :class="!form.logo && logoObligatorio? 'drop-required' : ''"
                         @dragover.prevent
                         @drop="onDrop($event, form)">
                      <div class="helper"></div>
                      <label v-if="!form.logo" class="btn-dragdrop display-inline">
                          Selecciona una imagen
                        <input type="file" name="image" @change="onChange($event, form)">
                      </label>
                      <div class="hidden display-inline align-center" v-else v-bind:class="{ 'image': true }">
                        <img
                          :src="form.logo"
                          alt=""
                          class="img" />
                         <br>
                         <br>
                         <button class="btn-eliminar" @click="removeFile(form)">Eliminar</button>
                       </div>
                       <br />
                       <span class='text-gray'>Tamaño maximo: 0.5 Mb</span>
                       <br />
                       <span class='text-red' v-if="!form.logo && logoObligatorio">La imagen es requerida</span>
                   </div>
                </v-col>
              </v-row>
            </v-container>
          </v-card>
        </v-form>
      </template>
    </app-dialog>
    <crud-table
      :headers="headers"
      description="Olimpiadas"
      :url.sync="urlListar"
      :widthModal="500"
      :order="order"
      :custom="true"
    >
      <template slot="buttons">
        <v-tooltip bottom color="primary">
          <template v-slot:activator="{ on }">
            <v-btn
              color="primary"
              :small="['xs', 'sm'].includes($vuetify.breakpoint.name)"
              icon
              v-on="on"
              id="addOlympiad"
              @click.native.stop="oModal"
              slot="activator"
              v-if="btnAgregar"
            >
              <v-icon-component icon="add" />
            </v-btn>
          </template>
          <span> Agregar olimpiada </span>
        </v-tooltip>
      </template>
      <template slot="items" slot-scope="items">
        <tr v-if="items.items.id === idSelected" :style="$vuetify.theme.dark ? 'background: #00516D' : 'background: #dbe9f5'">
          <td colspan="7" class="pa-0 ma-0" style="height: 30px !important; min-height: 30px !important; border-bottom: none">
            <v-alert
              text
              width="100%"
              dense
              elevation="0"
              color="info"
            >
              <v-card
                elevation="0"
                color="transparent"
                class="fs8 primary--text pt-1 pb-1"
              >Esta olimpiada se encuentra seleccionada para crear o seleccionar etapas</v-card>
            </v-alert>
          </td>
        </tr>
        <tr :class="items.items.id === idSelected ? `${$vuetify.theme.dark ? 'dark-is-selected' : 'light-is-selected'}` : ''">
          <td>{{ items.items.nombre }}</td>
          <td>{{ items.items.gestion }}</td>
          <td>{{ items.items.sigla }}</td>
          <td>
            {{ formatFecha(items.items.fechaInicio) }}
          </td>
          <td>
            {{ formatFecha(items.items.fechaFin) }}
          </td>
          <td>
            <v-tooltip bottom color="color1">
              <template v-slot:activator="{ on }">
                <v-btn
                  :ripple="false"
                  plain
                  text
                  class="cursor-normal"
                  color="color1"
                  v-on="on"
                >
                  <strong>
                   {{ items.items.estado }}
                  </strong>
                </v-btn>
              </template>
              {{ items.items.estado }}
            </v-tooltip>
          </td>
          <td>
<!--            <v-tooltip
              bottom
              color="info"
            >
              <template v-slot:activator="{ on }">
                <v-btn
                  icon
                  v-on="on"
                  color="info"
                  @click.stop="selectedOlympiad(items.items)"
                >
                  <v-icon-component icon="done"></v-icon-component>
                </v-btn>
              </template>
              <span>Seleccionar olimpiada</span>
            </v-tooltip>-->
            <v-tooltip
              bottom
              color="teal lighten-1"
              v-if="btnEditar && items.items.estado === 'ACTIVO'"
            >
              <template v-slot:activator="{ on }">
                <v-btn
                  icon
                  v-on="on"
                  color="success"
                  @click.stop="inactivar(items.items)"
                >
                  <v-icon-component icon="toggle_on"></v-icon-component>
                </v-btn>
              </template>
              <span>Inactivar</span>
            </v-tooltip>
            <v-tooltip
              bottom
              color="teal lighten-1"
              v-if="btnEditar && items.items.estado === 'INACTIVO'"
            >
              <template v-slot:activator="{ on }">
                <v-btn
                  icon
                  v-on="on"
                  color="error"
                  @click.stop="activar(items.items)"
                >
                  <v-icon-component icon="toggle_off"></v-icon-component>
                </v-btn>
              </template>
              <span>Activar</span>
            </v-tooltip>
            <v-tooltip bottom color="success" v-if="btnEditar && items.items.estado === 'ACTIVO'">
              <template v-slot:activator="{ on }">
                <v-btn
                  icon
                  v-on="on"
                  color="success"
                  @click.stop="oModal(items)"
                >
                  <v-icon-component icon="edit"></v-icon-component>
                </v-btn>
              </template>
              <span>Editar registro</span>
            </v-tooltip>
            <v-tooltip bottom color="error" v-if="btnEliminar && items.items.estado === 'ACTIVO'">
              <template v-slot:activator="{ on }">
                <v-btn
                  icon
                  v-on="on"
                  color="error"
                  @click.prevent="itemDelete(items)"
                >
                  <v-icon-component icon="delete"></v-icon-component>
                </v-btn>
              </template>
              <span>Eliminar registro</span>
            </v-tooltip>
          </td>
        </tr>
      </template>
    </crud-table>
  </v-card>
</template>
<script>
import { $Casbin } from '@/plugins/casbin';
import validate from '@/common/mixins/validate';
import CrudTable from '@/plugins/crud-table/CrudTable.vue';
import actions from '@/plugins/crud-table/mixins/crud-table';
import vIconComponent from '@/plugins/icon/index.vue';
import AppDialog from '@/plugins/modal/AppDialog.vue';
import DateInput from '@/plugins/date-input/DateInput.vue';
import moment from 'dayjs';

const MAX_SIZE_LOGO = 700000;

export default {
  mixins: [actions, validate],
  data: () => ({
    valid: false,
    url: 'olimpiadas',
    urlListar: 'olimpiadas/listar',
    order: ['createdAt', 'DESC'],
    headers: [
      {
        text: 'Olimpiada',
        sortable: false,
        align: 'center',
        value: 'nombre',
      },
      {
        text: 'Gestión',
        sortable: false,
        align: 'center',
        value: 'gestion',
      },
      {
        text: 'Sigla',
        sortable: false,
        align: 'center',
        value: 'sigla',
      },
      {
        text: 'Fecha inicio',
        sortable: false,
        align: 'center',
        value: 'fechaInicio',
      },
      {
        text: 'Fecha fin',
        sortable: false,
        value: 'fechaFin',
      },
      {
        text: 'Estado',
        sortable: false,
        value: 'estado',
      },
      {
        text: 'Acciones',
        divider: false,
        sortable: false,
        align: 'center',
        value: 'ACTIONS',
      },
    ],
    form: {
      id: null,
      olimpiada: null,
      gestion: null,
      sigla: null,
      leyenda: null,
      fechaInicio: null,
      fechaFin: null,
    },
    rules: {
      gestion: [
        v => !!v || 'Este campo es requerido.',
        v => (/^[0-9'\s]+$/.test(v)) || v === '' || 'Debe ser un número.',
        v => Number(v) >= new Date().getFullYear() || `Debe ser mayor o igual a ${new Date().getFullYear()}.`,
        v => Number(v) <= 2030 || 'Debe ser una gestión válida'
      ],
    },
    btnAgregar: true,
    btnEditar: true,
    btnEliminar: true,
    menufechaInicio: false,
    menufechaFin: false,
    modalOlimpiada: false,
    idSelected: null,
    minFechaInicio: new Date(new Date().getFullYear(), 0, 1),
    maxFechaInicio: new Date(new Date().getFullYear(), 11, 31),
    minFechaFin: new Date(new Date().getFullYear(), 0, 1),
    maxFechaFin: new Date(new Date().getFullYear(), 11, 31),
    gestionValida: false,
    image: '',
    logoObligatorio: false,
  }),
  mounted() {
    // Verificar permiso para crear
    if ($Casbin && $Casbin.enforcer) {
      const { rol } = this.$storage.get('rol');
      $Casbin.enforcer
        .enforce(rol, '/olimpiadas', 'create')
        .then((permitido) => {
          this.btnAgregar = permitido;
        });
      $Casbin.enforcer
        .enforce(rol, '/olimpiadas', 'update')
        .then((permitido) => {
          this.btnEditar = permitido;
        });
      $Casbin.enforcer
        .enforce(rol, '/olimpiadas', 'delete')
        .then((permitido) => {
          this.btnEliminar = permitido;
        });
    }
    this.loadParams();
    this.logoObligatorio = false;
  },
  destroyed () {
    this.$store.commit('setOlympiadBreadcrumb', '');
  },
  methods: {
    selectedOlympiad ({ id, nombre }) {
      this.$emit('selectedOlympiad', id);
      this.$store.commit('setOlympiadBreadcrumb', nombre);
      this.$store.commit('setStageBreadcrumb', '');
      this.$store.commit('setAreaBreadcrumb', '');
      this.idSelected = id;
    },
    obtenerFechaInicial(val) {
      this.form.fechaInicio = val;
    },
    obtenerFechaFinal(val) {
      this.form.fechaFin = val;
    },
    async loadParams() {
      await this.$service.get('roles').then((resultado) => {
        this.roles = resultado && resultado.datos ? resultado.datos : [];
      });
    },
    async activar(item) {
      const message = `¿Está seguro de activar ${item.nombre}?`;
      this.$confirm(message, async () => {
        const response = await this.$service.patch(
          `${this.url}/activacion/${item.id}`,
          {}
        );
        if (response.isOK) {
          this.$message.success(response.mensaje);
        } else {
          this.$message.error(response.message ?? response.mensaje ?? `Error al inactivar ${item.nombre}`);
        }
        this.closeModal();
        this.updateList();
      });
    },
    async inactivar(item) {
      const message = `¿Está seguro de inactivar ${item.nombre}?`;
      this.$confirm(message, async () => {
        const response = await this.$service.patch(
          `${this.url}/inactivacion/${item.id}`,
          {}
        );
        if (response.isOK) {
          this.$message.success(response.mensaje);
        } else {
          this.$message.error(response.message ?? response.mensaje ?? `Error al inactivar ${item.nombre}`);
        }
        this.closeModal();
        this.updateList();
      });
    },
    formatFecha(dateOriginal, formato = 'DD/MM/YYYY') {
      return dateOriginal ? this.$datetime.format(formato, dateOriginal) : '';
    },
    formatFechaValidar(dateOriginal, formato, formatoNuevo) {
      if (moment(dateOriginal, formato, 'es').isValid()) {
        return moment(dateOriginal, formato).format(formatoNuevo);
      } else return dateOriginal;
    },
    ultimoDiaGestion(newValue) {
      return new Date(newValue, 11, 31).toISOString().substr(0, 10);
    },
    primerDiaGestion(newValue) {
      return new Date(newValue, 0, 1).toISOString().substr(0, 10);
    },
    reset() {
      this.form.fechaInicio = null;
      this.form = {
        id: null,
        olimpiada: null,
        gestion: null,
        sigla: null,
        leyenda: null,
        logo: null,
        fechaInicio: null,
        fechaFin: null,
      };
      this.gestionValida = false;
      this.logoObligatorio = false;
    },

    async itemDelete({ items }) {
      // Verificar permiso para ejecutar esta funcion
      if ($Casbin && $Casbin.enforcer) {
        const { rol } = this.$storage.get('rol');
        const permitido = await $Casbin.enforcer.enforce(
          rol,
          '/olimpiadas',
          'delete'
        );
        if (!permitido) {
          this.$message.warning('No tiene permisos');
          return;
        }
      }
      const message = '¿Está seguro de eliminar este registro?';
      this.$confirm(
        message,
        async () => {
          const response = await this.$service.delete(`${this.url}/${items.id}`);
          if (response.isOK) {
            this.updateList();
            this.closeModal();
            this.$message.success('Registro eliminado satisfactoriamente');
          } else {
            this.$message.error(response.message ?? response.mensaje);
          }
        },
        () => {}
      );
    },
    closeModal() {
      this.modalOlimpiada = false;
      this.reset();
    },
    async oModal({ items }) {
      if (items && items.id) {
        this.form = { ...items };

        this.minFechaInicio = this.primerDiaGestion(this.form.gestion);
        this.maxFechaInicio = this.ultimoDiaGestion(this.form.gestion);
        this.minFechaFin = this.primerDiaGestion(this.form.gestion);
        this.maxFechaFin = this.ultimoDiaGestion(this.form.gestion);

        this.form.fechaInicio = this.formatFecha(
          this.form.fechaInicio,
          'DD-MM-YYYY'
        );
        this.form.fechaFin = this.formatFecha(this.form.fechaFin, 'DD-MM-YYYY');
      } else {
        this.minFechaInicio = this.primerDiaGestion(new Date().getFullYear());
        this.maxFechaInicio = this.ultimoDiaGestion(new Date().getFullYear());
        this.minFechaFin = this.primerDiaGestion(new Date().getFullYear());
        this.maxFechaFin = this.ultimoDiaGestion(new Date().getFullYear());
        this.reset();
      }
      this.modalOlimpiada = true;
    },

    /**
     * @function save
     * @description Esta funcion esta creada para guardar en la BD
     * @author dbarra@agetic.gob.bo
     */
    async save() {
      if (this.$refs.form.validate() && this.form.logo) {
        const data = { ...this.form };

        data.fechaInicio = this.formatFechaValidar(data.fechaInicio, 'DD-MM-YYYY', 'YYYY-MM-DD');
        data.fechaFin = this.formatFechaValidar(data.fechaFin, 'DD-MM-YYYY', 'YYYY-MM-DD');
        /* data.logo = this.image; */
        if (data.id) {
          const response = await this.$service.patch(
            `${this.url}/${data.id}`,
            data
          );
          if (response.isOK) {
            this.closeModal();
            this.updateList();
            this.$message.success('Se actualizó el registro correctamente');
          } else {
            this.$message.error(
              response.mensaje ?? 'Ocurrio un error al tratar de enviar la data'
            );
          }
        } else {
          delete data.id;
          const response = await this.$service.post(this.url, data);
          if (response.isOK) {
            console.info(`Exito: ${response}`);
            this.closeModal();
            this.updateList();
            this.$message.success('El registro fue agregado correctamente');
          } else {
            console.info(`Error: ${response}`);
            this.$message.error(
              response.mensaje ?? 'Ocurrio un error al tratar de enviar la data'
            );
          }
        }
      } else {
        this.logoObligatorio = true;
        this.$message.error('Complete los campos obligatorios');
      }
    },
    onDrop: (e) => {
      e.stopPropagation();
      e.preventDefault();
      const { files } = e.dataTransfer;
      this.createFile(files[0]);
      if (!this.logoObligatorio) {
        this.logoObligatorio = true;
      }
    },
    onChange(e, item) {
      const { files } = e.target;
      this.createFile(files[0], item);
      if (!this.logoObligatorio) {
        this.logoObligatorio = true;
      }
    },
    createFile(file, item) {
      if (!file.type.match('image.*')) {
        this.$message.error('Selecciona una imagen');
        return;
      }
      const reader = new FileReader();

      reader.onload = (e) => {
        this.image = e.target.result;
        item.logo = e.target.result;
        const blob = new Blob([item.logo]).size;
        if (blob > MAX_SIZE_LOGO) {
          this.$message.error('La imagen es muy grande.');
          item.logo = '';
        }
      };
      reader.readAsDataURL(file);
    },
    removeFile(item) {
      item.logo = '';
    },
    compararFechas(fechaInicio, fechaFin) {
      return moment(fechaInicio, 'DD-MM-YYYY', 'es') > moment(fechaFin, 'DD-MM-YYYY', 'es');
    }
  },
  watch: {
    'form.gestion'(newValue) {
      if (!this.form.id) {
        if (newValue) {
          this.form.fechaInicio = null;// this.formatFechaValidar(new Date().toISOString().substr(0, 10), 'YYYY-MM-DD', 'DD-MM-YYYY');
        }
        this.form.fechaFin = null;
      }
      this.maxFechaInicio = this.ultimoDiaGestion(newValue);
      this.minFechaInicio = !this.form.id ? this.formatFechaValidar(new Date().toISOString().substr(0, 10), 'DD-MM-YYYY', 'YYYY-MM-DD') : null;
      this.maxFechaFin = this.ultimoDiaGestion(newValue);
      this.minFechaFin = this.primerDiaGestion(newValue);
      if (newValue) {
        this.gestionValida = Number(newValue) >= 2020 && Number(newValue) <= 2040;
      }
    },
    'form.fechaInicio'(newValue) {
      this.minFechaFin = newValue;
    },
    'form.fechaFin'(newValue) {
      this.maxFechaInicio = newValue;
    }
  },
  components: {
    AppDialog,
    CrudTable,
    vIconComponent,
    DateInput
  },
};
</script>
<style lang="scss" scoped>
.dark-is-selected {
  background: #00516D !important;
}
.light-is-selected {
  background: #dbe9f5 !important;
}

.theme--dark .drop {
  background-color: #635e5e !important;
  border: 4px dashed #ccc;
}

.btn-dragdrop {
  background-color: #2A72D1;
  border: 0;
  border-radius:10px;
  color: #fff;
  cursor: pointer;
  display: inline-block;
  font-weight: bold;
  padding: 15px 35px;
  position: relative;
}

.btn-dragdrop:hover {
  background-color: #6996D1;
}

.btn-eliminar {
  background-color: #d31419;
  border: 0;
  border-radius:10px;
  color: #fff;
  cursor: pointer;
  display: inline-block;
  font-weight: bold;
  padding: 15px 35px;
  position: relative;
}

.btn-eliminar:hover {
  background-color: #f3461f;
}

input[type="file"] {
  position: absolute;
  opacity: 0;
  z-index: -1;
}

.align-center {
  text-align: center;
}

.helper {
  height: 100%;
  display: inline-block;
  vertical-align: middle;
  width: 0;
}

.hidden {
  display: none !important;
}

.hidden.image {
  display: inline-block !important;
}

.display-inline {
  display: inline-block;
  vertical-align: middle;
}

.img {
  border: 1px solid #f6f6f6;
  display: inline-block;
  height: auto;
  max-height: 80%;
  max-width: 80%;
  width: auto;
}

.drop {
  background-color: #f2f2f2;
  border: 4px dashed #ccc;
  background-color: #f6f6f6;
  border-radius: 2px;
  height: 100%;
  max-height: 400px;
  max-width: 600px;
  width: 100%;
}
.drop-required {
  border: 3px dashed red !important;
}
.date-required {
  border: 1px dashed red !important;
}
.text-gray {
  color: gray;
}
.text-red {
  color: red;
}
</style>
