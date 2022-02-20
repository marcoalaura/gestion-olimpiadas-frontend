<template>
  <v-card elevation="0">
    <!-- SLOT PARA EL FORMULARIO -->
    <app-dialog :dialog.sync="modalArea"
                :titulo="form.id ? 'Editar área' : 'Adicionar área'"
                @open-dialog="modalArea = true;"
                @close-dialog="modalArea = false;"
                @accion="save"
                max-width="675px"
    >
      <template v-if="modalArea">
        <!-- FORMULARIO PARA AGREGAR O EDITAR -->
        <v-form :key="`area-${form.id}`" ref="form" v-model="valid" lazy-validation @submit.prevent="save">
          <v-card elevation="0">
            <v-container fluid>
              <v-card elevation="0" class="primary--text mb-3">Datos del área</v-card>
              <v-row>
                <v-col cols="12" md="12" xs="12" sm="12" lg="12">
                  <v-input-text-field
                    @value="e => form.nombre = e"
                    :init="form.nombre"
                    v-model="form.nombre"
                    label="Nombre de área"
                    required
                    full-width
                    :clearable="false"
                    dense
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
      <template slot="items" slot-scope="items">
        <tr>
          <td>{{ items.items.nombre }}</td>
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
            <v-icon-tooltip
                v-if="btnEditar && (items.items.estado === 'ACTIVO')"
                color="info"
                icon="toggle_on"
                text="Inactivar"
                @accion="inactivar(items.items)"
            />
            <v-icon-tooltip
                v-if="btnEditar && (items.items.estado === 'INACTIVO')"
                color="error"
                icon="toggle_off"
                text="Activar"
                @accion="activar(items.items)"
            />
            <v-icon-tooltip
                v-if="btnEditar && (items.items.estado === 'INACTIVO')"
                color="error"
                icon="toggle_off"
                text="Activar"
                @accion="activar(items.items)"
            />
            <v-icon-tooltip
                v-if="btnEditar"
                color="success"
                icon="edit"
                text="Editar registro"
                @accion="oModal(items)"
            />
            <v-icon-tooltip
                v-if="btnEliminar"
                color="error"
                icon="delete"
                text="Eliminar registro"
                @accion="itemDelete(items)"
            />
          </td>
        </tr>
      </template>
    </app-dialog>
    <crud-table :headers="headers" description="Áreas"
      :url.sync="urlListar" :widthModal="500" :order="order"
      :custom="true">
      <template slot="buttons">
        <v-icon-tooltip
            v-if="btnAgregar"
            id="addAreas"
            color="primary"
            icon="add"
            text="Agregar área"
            @accion="oModal({})"
        />
      </template>
      <template slot="items" slot-scope="items">
        <tr>
          <td>{{ items.items.nombre }}</td>
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
            <v-icon-tooltip
                v-if="btnEditar && (items.items.estado === 'ACTIVO')"
                color="info"
                icon="toggle_on"
                text="Inactivar"
                @accion="inactivar(items.items)"
            />
            <v-icon-tooltip
                v-if="btnEditar && (items.items.estado === 'INACTIVO')"
                color="error"
                icon="toggle_off"
                text="Activar"
                @accion="activar(items.items)"
            />
            <v-icon-tooltip
                v-if="btnEditar"
                color="success"
                icon="edit"
                text="Editar registro"
                @accion="oModal(items)"
            />
            <v-icon-tooltip
                v-if="btnEliminar"
                color="error"
                icon="delete"
                text="Eliminar registro"
                @accion="itemDelete(items)"
            />
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
import AppDialog from '@/plugins/modal/AppDialog.vue';

const MAX_SIZE_LOGO = 700000;

export default {
  mixins: [actions, validate],
  data: () => ({
    valid: false,
    url: 'areas',
    urlListar: 'areas/listar',
    order: ['createdAt', 'DESC'],
    headers: [
      {
        text: 'Nombre',
        sortable: false,
        align: 'center',
        value: 'nombre'
      },
      {
        text: 'Estado',
        sortable: false,
        align: 'center',
        value: 'estado'
      },
      {
        text: 'Acciones',
        sortable: false,
        align: 'center',
        value: 'ACTIONS'
      }
    ],
    form: {
      id: null,
      area: null,
      gestion: null,
      fechaInicio: null,
      fechaFin: null,
    },
    btnAgregar: true,
    btnEditar: true,
    btnEliminar: true,
    menufechaInicio: false,
    menufechaFin: false,
    modalArea: false,
    image: '',
    logoObligatorio: false,
  }),
  mounted() {
    // Verificar permiso para crear
    if ($Casbin && $Casbin.enforcer) {
      const { rol } = this.$storage.get('rol');
      $Casbin.enforcer.enforce(rol, '/areas', 'create')
        .then(permitido => {
          this.btnAgregar = permitido;
        });
      $Casbin.enforcer.enforce(rol, '/areas', 'update')
        .then(permitido => {
          this.btnEditar = permitido;
        });
      $Casbin.enforcer.enforce(rol, '/areas', 'delete')
        .then(permitido => {
          this.btnEliminar = permitido;
        });
    }
    this.loadParams();
    this.logoObligatorio = false;
  },
  computed: {},
  methods: {
    async loadParams() {
      await this.$service.get('roles')
        .then((resultado) => {
          this.roles = resultado && resultado.datos ? resultado.datos : [];
        });
    },
    async activar(item) {
      const message = `¿Está seguro de activar ${item.nombre}?`;
      this.$confirm(
        message,
        async () => {
          const response = await this.$service.patch(`${this.url}/activacion/${item.id}`, {});
          if (response.isError) {
            this.$message.success(response.mensaje);
          } else {
            this.$message.error(response.mensaje ?? response.message ?? `Error al activar ${item.nombre}`);
          }
          this.closeModal();
          this.updateList();
        }
      );
    },
    async inactivar(item) {
      const message = `¿Está seguro de inactivar ${item.nombre}?`;
      this.$confirm(
        message,
        async () => {
          const response = await this.$service.patch(`${this.url}/inactivacion/${item.id}`, {});
          if (response.isOK) {
            this.$message.success(response.mensaje);
          } else {
            this.$message.error(response.mensaje ?? response.message ?? `Error al inactivar ${item.nombre}`);
          }
          this.closeModal();
          this.updateList();
        }
      );
    },
    reset() {
      this.form = {
        id: null,
        area: null,
        gestion: null,
        fechaInicio: null,
        fechaFin: null,
        logo: null,
      };
      this.logoObligatorio = false;
    },

    async itemDelete({ items }) {
      // Verificar permiso para ejecutar esta funcion
      if ($Casbin && $Casbin.enforcer) {
        const { rol } = this.$storage.get('rol');
        const permitido = await $Casbin.enforcer.enforce(rol, '/areas', 'delete');
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
        () => {
        }
      );
    },
    closeModal() {
      this.modalArea = false;
      this.reset();
    },
    async oModal({ items }) {
      if (items && items.id) {
        this.form = { ...items };
      } else {
        this.reset();
      }
      this.modalArea = true;
    },

    /**
     * @function save
     * @description Esta funcion esta creada para guardar en la BD
     * @author dbarra@agetic.gob.bo
     */
    async save() {
      if (this.$refs.form.validate() && this.form.logo) {
        const data = { ...this.form };
        if (data.id) {
          const response = await this.$service.patch(`${this.url}/${data.id}`, data);
          if (response.isOK) {
            this.closeModal();
            this.updateList();
            this.$message.success('Se actualizó el registro correctamente');
          } else {
            this.$message.error(response.mensaje ?? 'Ocurrio un error al tratar de enviar la data');
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
            this.$message.error(response.mensaje ?? 'Ocurrio un error al tratar de enviar la data');
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
  },
  components: {
    CrudTable,
    AppDialog
  }
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
