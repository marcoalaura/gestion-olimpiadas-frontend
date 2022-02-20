<template>
  <v-card elevation="0">
    <app-dialog
        :dialog.sync="modalUsuario"
        :icono="form.id ? 'edit' : 'add'"
        :titulo="form.id ? 'Editar Usuario' : 'Adicionar Usuario'"
        @open-dialog="modalUsuario = true;"
        @close-dialog="closeModal"
        max-width="1150px"
        @accion="save"
        :textoEjecutar="form.id ? 'Actualizar' : 'Guardar'"
    >
      <!-- SLOT PARA EL FORMULARIO -->
      <template v-if="modalUsuario">
        <!-- FORMULARIO PARA AGREGAR O EDITAR -->
        <v-card elevation="0">
          <v-form :key="`usuario-${form.id}`" ref="form" v-model="valid" lazy-validation @submit.prevent="save">
            <v-row no-gutters class="justify-space-between" align="center">
              <v-col>
                <div class="pt-4 pl-6 pb-0">
                  Para confirmar cualquier cambio, presione el boton {{ form.id ? '"Actualizar"' : '"Guardar"' }}
                </div>
              </v-col>
            </v-row>
            <v-row class="ma-4">
              <v-col cols="12" md="4" xs="12" sm="4" lg="4" class="d-flex justify-center">
                <v-card v-if="usarCiudadaniaCheckBox" elevation="0"
                        class="primary--text mb-3 ciudadania--text ml-3 rounded">
                  Campos deshabilitados por usar Ciudadanía Digital
                </v-card>
                <form-persona
                    v-if="modalUsuario"
                    :persona="form.persona"
                    :deshabilitarCampos="usarCiudadaniaCheckBox || form.id!=null"
                    :deshabilitar-carnet="form.id!=null"
                    @value="obtenerPersona"></form-persona>
              </v-col>
              <v-col cols="12" md="4" xs="12" sm="4" lg="4" class="d-flex justify-center">
                <v-container>
                  <v-card elevation="0" class="primary--text mb-3">Datos del usuario</v-card>
                  <v-card class="pa-4" outlined rounded>
                    <v-input-text-field
                        @value="e => form.correoElectronico = e"
                        :init="form.correoElectronico"
                        v-model="form.correoElectronico"
                        :disabled="form.ciudadaniaDigital || usarCiudadaniaCheckBox"
                        label="Correo Electrónico"
                        required
                        dense
                        :full-width="false"
                        @keyup="form.correoElectronico = $util.textToUppercase(form.correoElectronico)"
                        :width="300"
                        :clearable="false"
                        :rules="!usarCiudadaniaCheckBox ? $validate(['required', 'email']) : []"
                    />
                    <v-input-text-field
                        @value="e => form.persona.telefono = e"
                        :init="form.persona.telefono"
                        v-model="form.persona.telefono"
                        :disabled="form.persona.ciudadaniaDigital || usarCiudadaniaCheckBox"
                        label="Nro. celular"
                        required
                        dense
                        maxlength="8"
                        :full-width="false"
                        @keyup="form.persona.telefono = $util.textToUppercase(form.persona.telefono)"
                        :width="300"
                        :clearable="false"
                        :rules="$validate(['celular'])"
                    />
                  </v-card>
                </v-container>
              </v-col>
              <v-col cols="12" md="4" xs="12" sm="4" lg="4">
                <v-container>
                  <v-row no-gutters class="justify-space-between" align="center">
                    <div class="primary--text">
                      Roles asignados:
                    </div>
                    <v-icon-tooltip
                        color="primary"
                        icon="add"
                        text="Agregar Olimpiada y rol"
                        :disabled="deshabilitarAgregarOlimpiada() && this.form.olimpiadas.length > 0"
                        @accion="addOptionOlimpiada(); addOption(this.form.olimpiadas.length);"
                    />
                  </v-row>
                  <div v-for="(olimpiada, indexOlimpiada) in form.olimpiadas"
                       :key="`olimpiada-${indexOlimpiada}`" class="pt-2">
                    <v-row no-gutters class="justify-space-between" align="center">
                      <label v-if="olimpiada.editar" class="label-input-text">
                        Olimpiada
                      </label>
                      <v-icon-tooltip
                          v-if="olimpiada.editar"
                          color="error"
                          @accion="removeOlimpiada(indexOlimpiada)"
                          :disabled="form.olimpiadas.length === 1"
                          icon="remove_circle_outline"
                          text="Eliminar"
                      />
                    </v-row>
                    <v-row no-gutters class="justify-space-between" align="center">
                      <div v-if="!olimpiada.editar" class="label-input-text pb-2">
                        {{ olimpiada.olimpiada.nombre }}
                      </div>
                      <v-select
                          v-if="olimpiada.editar"
                          color="primary"
                          required
                          dense
                          item-color="primary"
                          v-model="olimpiada.id"
                          :items="olimpiadas"
                          item-text="nombre"
                          item-value="id"
                          outlined
                          :loading="loading"
                          hide-details
                          @change="changeOlimpiada(indexOlimpiada, olimpiada.id)"
                          :rules="$validate(['required'])"
                      ></v-select>
<!--                      <v-icon-tooltip
                          v-if="olimpiada.editar"
                          color="primary"
                          icon="add"
                          text="Agregar Rol"
                          @accion="addOption(indexOlimpiada);"
                          :disabled="deshabilitarAgregarRol(indexOlimpiada) || olimpiada.olimpiada.id === null || olimpiada.olimpiada.id === ''"
                      />-->
                    </v-row>
                    <div class="pa-2"></div>
                    <div class="pb-4" v-for="(rol, index) in olimpiada.usuarioRol"
                         :key="`rol-${index}`">
                      <v-card class="pa-4" outlined rounded>
                        <v-row no-gutters>
                          <v-col>
                            <v-row no-gutters class="justify-space-between" align="center">
                              <label class="label-input-text">Rol</label>
                              <v-tooltip color="primary" bottom v-if="!rol.editar">
                                <template v-slot:activator="{ on, attrs }">
                                  <div
                                      v-bind="attrs"
                                      v-on="on"
                                      style="width:min-content;"
                                  >
                                    <v-switch
                                        inset
                                        flat
                                        class="ma-0 pa-0"
                                        style="transform: scale(0.7); transform-origin: bottom;"
                                        v-model="rol.esActivo"
                                        @change="changeState(indexOlimpiada, index, rol.esActivo)"
                                    />
                                  </div>
                                </template>
                                <div>
                                  Activar inactivar rol
                                </div>
                              </v-tooltip>
<!--                              <v-icon-tooltip
                                  v-if="rol.editar"
                                  color="error"
                                  @accion="removeOption(indexOlimpiada, index)"
                                  icon="remove_circle_outline"
                                  text="Eliminar rol"
                              />-->
                            </v-row>
                            <v-select
                                color="primary"
                                required
                                dense
                                :disabled="!rol.editar"
                                :readonly="!rol.editar"
                                v-model="rol.idRol"
                                item-color="primary"
                                :items="crearGruposRoles(roles)"
                                item-text="nombre"
                                item-value="id"
                                @change="changeRol(indexOlimpiada, index, rol.idRol)"
                                outlined
                                hide-details
                                :rules="$validate(['required'])"
                            ></v-select>
                          </v-col>
                        </v-row>
                        <div :key="`campo-${campo}-rol-${index}-${indexOlimpiada}`"
                             v-for="campo in rol.campos">
                          <v-row v-if="campo === 'idEtapa'" class="pt-4 pb-1">
                            <v-col>
                              <v-input-text-field
                                  label="Etapa"
                                  full-width
                              >
                                <template slot="contenido">
                                  <v-select
                                      color="primary"
                                      required
                                      item-color="primary"
                                      v-model="rol[campo]"
                                      :items="olimpiada.etapas"
                                      item-text="nombre"
                                      item-value="id"
                                      outlined
                                      :loading="loading"
                                      dense
                                      hide-details
                                      :rules="$validate(['required'])"
                                  >
                                  </v-select>
                                </template>
                              </v-input-text-field>
                            </v-col>
                          </v-row>
                          <v-row v-if="campo === 'idArea'" class="pt-4 pb-1">
                            <v-col>
                              <v-input-text-field
                                  label="Área"
                              >
                                <template slot="contenido">
                                  <v-select
                                      color="primary"
                                      required
                                      item-color="primary"
                                      v-model="rol[campo]"
                                      :items="areas"
                                      item-text="nombre"
                                      item-value="id"
                                      outlined
                                      dense
                                      hide-details
                                      :rules="$validate(['required'])"
                                  >
                                  </v-select>
                                </template>
                              </v-input-text-field>
                            </v-col>
                          </v-row>
                          <v-row v-if="campo === 'idDepartamento'" class="pt-4 pb-1">
                            <v-col>
                              <v-input-text-field
                                  label="Departamento"
                              >
                                <template slot="contenido">
                                  <v-select
                                      color="primary"
                                      required
                                      item-color="primary"
                                      v-model="rol.idDepartamento"
                                      :items="departamentos"
                                      item-text="nombre"
                                      item-value="id"
                                      outlined
                                      dense
                                      @change="searchTermDistrito = null; cargarDistritosForm(indexOlimpiada, index, rol.idDepartamento);"
                                      hide-details
                                      :rules="$validate(['required'])"
                                  ></v-select>
                                </template>
                              </v-input-text-field>
                            </v-col>
                          </v-row>
                          <v-row v-if="campo === 'idDistrito'" class="pt-4 pb-1">
                            <v-col>
                              <v-input-text-field
                                  label="Distrito"
                              >
                                <template slot="contenido">
                                  <v-select v-model="rol.idDistrito"
                                            dense
                                            :loading="loading"
                                            item-text="nombre"
                                            item-value="id" :items="rol.distritos" attach outlined flat solo
                                            :rules="$validate(['required'])">
                                    <template v-slot:prepend-item>
                                      <v-list-item>
                                        <v-list-item-content>
                                          <v-text-field
                                              v-model="searchTermDistrito"
                                              placeholder="Buscar distritos"
                                              @input="cargarDistritosForm(indexOlimpiada, index, rol.idDepartamento)">
                                          </v-text-field>
                                        </v-list-item-content>
                                      </v-list-item>
                                    </template>
                                  </v-select>
                                </template>
                              </v-input-text-field>
                            </v-col>
                          </v-row>
                          <v-row v-if="campo === 'idUnidadEducativa'" class="pt-4 pb-1">
                            <v-col>
                              <v-input-text-field
                                  label="Unidad educativa"
                              >
                                <template slot="contenido">
                                  <v-select v-model="rol.idUnidadEducativa" item-text="nombre"
                                            :loading="loading"
                                            item-value="id" :items="rol.unidadesEducativas" attach outlined flat solo
                                            :rules="$validate(['required'])">
                                    <template slot="selection" slot-scope="data">
                                      <v-list-item dense>
                                        <v-list-item-content>
                                          <v-list-item-title>{{ data.item.nombre }}</v-list-item-title>
                                          <v-list-item-subtitle>{{ data.item.codigoSie }} -
                                            {{ data.item.distrito.departamento.nombre }}
                                          </v-list-item-subtitle>
                                        </v-list-item-content>
                                      </v-list-item>
                                    </template>
                                    <template slot="item" slot-scope="data">
                                      <v-list dense>
                                        <v-list-item>
                                          <v-list-item-content>
                                            <v-list-item-title>{{ data.item.nombre }}</v-list-item-title>
                                            <v-list-item-subtitle>{{ data.item.codigoSie }} -
                                              {{ data.item.distrito.departamento.nombre }}
                                            </v-list-item-subtitle>
                                          </v-list-item-content>
                                        </v-list-item>
                                      </v-list>
                                    </template>
                                    <template v-slot:prepend-item>
                                      <v-list-item>
                                        <v-list-item-content>
                                          <v-text-field
                                              v-model="searchTermUnidadEducativa"
                                              placeholder="Buscar Unidad Educativa"
                                              @input="cargarUnidadesEducativasForm(indexOlimpiada, index)"></v-text-field>
                                        </v-list-item-content>
                                      </v-list-item>
                                    </template>
                                  </v-select>
                                </template>
                              </v-input-text-field>
                            </v-col>
                          </v-row>
                        </div>
                      </v-card>
                    </div>
                  </div>
                </v-container>
              </v-col>
            </v-row>
          </v-form>
        </v-card>
      </template>
    </app-dialog>
    <crud-table
        v-if="showCrudTable"
        :headers="headers" description="Usuarios" :url.sync="url" :widthModal="500" :order="order"
        :filters.sync="filters"
        :show-filter-init="true"
        :filtro-as-query="true"
        :omitir-carga-on-mounted="true"
        :custom="true">
      <template slot="buttons">
        <v-icon-tooltip
            v-if="btnAgregar"
            color="primary"
            icon="add"
            @accion="oModal({})"
            text="Agregar usuario"
        />
      </template>

      <!-- SLOT PARA TODOS LOS ITEMS (Solo en caso de que se quiera personalizar cada columna o mas de 1 columna) -->
      <template slot="items" slot-scope="items">
        <tr>
          <td>{{ items.items.persona.nroDocumento }}</td>
          <td>
            <span>
              {{ items.items.persona.nombres }}
              {{ items.items.persona.primerApellido }}
              {{ items.items.persona.segundoApellido }}
            </span>
            <br>
            <v-btn v-if="items.items.ciudadaniaDigital" color="ciudadania" outlined x-small>
              Ciudadanía Digital
            </v-btn>
          </td>
          <td>{{ items.items.usuario }}</td>
          <td>
            <div v-for="olimpiada in items.items.olimpiadas" :key="olimpiada.id">
              <br>
              <v-chip small dark outlined color="primary">
                <v-icon-component icon="emoji_events"/>
                {{ olimpiada.olimpiada.nombre }}
              </v-chip>
              <v-tooltip v-for="rol in olimpiada.usuarioRol" :key="rol.id" bottom :disabled="rol.rol.grupo !=='ACTOR'">
                <template #activator="{ on }">
                  <v-chip v-on="on" max-width="100" small :color="rol.rol.grupo ==='ACTOR' ? 'color2': 'color3'" dark
                          :disabled="rol.estado === 'INACTIVO'">
                    <div style="color: white">
                      {{ rol.rol.nombre }}
                    </div>
                  </v-chip>
                </template>
                <span>
                  {{ rol.departamento ? `Departamento: ${rol.departamento.nombre}` : '' }}
                  {{ rol.distrito ? `Distrito: ${rol.distrito.nombre}` : '' }}
                  {{ rol.area ? `Área: ${rol.area.nombre}` : '' }}
                  {{ rol.unidadEducativa ? `Unidad educativa: ${rol.unidadEducativa.nombre}` : '' }}
                  {{ rol.etapa ? `Etápa: ${rol.etapa.nombre}` : '' }}
                </span>
              </v-tooltip>
            </div>
            <br>
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
            <v-tooltip bottom color="primary" v-if="btnEditar">
              <template v-slot:activator="{ on }">
                <v-btn icon v-on="on"
                       :color="['ASIGNADO', 'ACTIVO'].includes(items.items.estado) ? 'success' : 'error'"
                       @click.prevent="itemDelete(items)">
                  <v-icon-component v-if="['ASIGNADO', 'ACTIVO'].includes(items.items.estado)"
                                    icon="toggle_on"/>
                  <v-icon-component v-if="['INACTIVO', 'CREADO'].includes(items.items.estado)"
                                    icon="toggle_off"/>
                </v-btn>
              </template>
              <span>{{ items.items.estado === 'INACTIVO' ? 'Activar usuario' : 'Inactivar usuario' }}</span>
            </v-tooltip>
            <v-tooltip bottom color="teal lighten-1"
                       v-if="btnEditar && (items.items.estado === 'ACTIVO' || items.items.estado === 'ASIGNADO')">
              <template v-slot:activator="{ on }">
                <v-btn icon v-on="on" color="info" @click.stop="passwordRecovery(items.items.id)"
                       :disabled="items.items.ciudadaniaDigital">
                  <v-icon-component icon="vpn_key"></v-icon-component>
                </v-btn>
              </template>
              <span>Restablecer Contraseña</span>
            </v-tooltip>
            <v-tooltip bottom color="success" v-if="btnEditar">
              <template v-slot:activator="{ on }">
                <v-btn icon v-on="on" color="success" @click.stop="oModal(items)"
                       :disabled="['INACTIVO'].includes(items.items.estado)">
                  <v-icon-component icon="edit"></v-icon-component>
                </v-btn>
              </template>
              <span>Editar registro</span>
            </v-tooltip>
          </td>
        </tr>
      </template>
    </crud-table>
  </v-card>
</template>
<script>

import security from '@/common/mixins/security';
import validate from '@/common/mixins/validate';
import CrudTable from '@/plugins/crud-table/CrudTable.vue';
import actions from '@/plugins/crud-table/mixins/crud-table';
import FormPersona from '@/components/personas/form.vue';
import vIconComponent from '@/plugins/icon/index.vue';
import AppDialog from '@/plugins/modal/AppDialog.vue';
import moment from 'dayjs';

const customParseFormat = require('dayjs/plugin/customParseFormat');

moment.extend(customParseFormat);

export default {
  mixins: [security, actions, validate],
  data: () => ({
    loading: false,
    valid: false,
    url: 'usuarios',
    order: ['createdAt', 'DESC'],
    headers: [
      {
        text: 'Nro. Documento',
        align: 'center',
        value: 'nroDocumento'
      },
      {
        text: 'Persona',
        align: 'center',
        value: 'nombre'
      },
      {
        text: 'Usuario',
        align: 'center',
        value: 'nombre'
      },
      {
        text: 'Rol',
        align: 'center',
        value: 'usuario'
      },
      {
        text: 'Estado',
        sortable: false,
        value: 'estado'
      },
      {
        text: 'Acciones',
        divider: false,
        sortable: false,
        align: 'center',
        value: 'ACTIONS'
      }
    ],
    flagTecnicoSie: null,
    olimpiadasOpciones: [],
    form: {
      id: null,
      usuario: null,
      persona: {
        id: null,
        nombres: null,
        primerApellido: null,
        segundoApellido: null,
        nroDocumento: null,
        fechaNacimiento: null,
        telefono: null,
      },
      ciudadaniaDigital: false,
      actor: false,
      idOlimpiada: null,
      idEtapa: null,
      idArea: null,
      idDepartamento: null,
      idUnidadEducativa: null,
      roles: [],
      rolesID: [],

      estado: 'ACTIVO'
    },
    btnAgregar: true,
    btnEditar: true,
    btnEliminar: true,
    roles: [],
    modalUsuario: false,
    usarCiudadaniaCheckBox: null,
    filters: [],
    olimpiadas: [],
    etapas: [],
    areas: [],
    departamentos: [],
    distritos: [],
    unidadesEducativas: [],
    searchTermUnidadEducativa: null,
    searchTermDistrito: null,
    listaRolesHabilitados: [],
    showCrudTable: false
  }),
  mounted() {
    this.olimpiadaSeleccionada = null;
    this.idOlimpiadaSeleccionada = null;

    this.loadParams();
  },
  methods: {
    async loadParams() {
      this.$nextTick(async () => {
        const { rol } = this.$storage.get('rol');
        this.btnAgregar = await this.$check(rol, '/usuarios', 'create');
        this.btnEditar = await this.$check(rol, '/usuarios', 'update');
        this.btnEliminar = await this.$check(rol, '/usuarios', 'delete');
      });

      await this.$service.get('olimpiadas?limite=50&pagina=1')
        .then((resultado) => {
          this.olimpiadas = resultado && resultado.datos && resultado.datos.filas
            ? resultado.datos.filas.filter(olimpiada => (olimpiada.estado === 'ACTIVO' || olimpiada.estado === 'CERRADO'))
            : [];
        });

      await this.cargarRoles();
      await this.cargarRolesFiltro();

      await this.$service.get('areas')
        .then((resultado) => {
          this.areas = resultado && resultado.datos && resultado.datos.filas ? resultado.datos.filas : [];
        });
      await this.$service.get('departamentos')
        .then((resultado) => {
          this.departamentos = resultado && resultado.datos ? resultado.datos : [];
        });
      await this.cargarUnidadesEducativas();
    },
    addOption(indexOlimpiada) {
      this.loading = true;
      console.log(`Olimpiada index: ${indexOlimpiada}`);
      this.form.olimpiadas[indexOlimpiada].usuarioRol.unshift({
        idRol: '',
        rol: {
          rol: '',
          id: ''
        },
        campos: [],
        editar: true,
        esActivo: true,
      });
      this.loading = false;
    },
    addOptionOlimpiada() {
      this.loading = true;
      console.log(`Añadiendo olimpiada a : ${this.form.olimpiadas}`);
      if (this.form.olimpiadas == null) {
        this.form.olimpiadas = [];
      }
      this.form.olimpiadas.unshift({
        editar: true,
        id: '',
        olimpiada: {},
        usuarioRol: [],
      });
      console.log(`resultado olimpiada a : ${this.form.olimpiadas}`);
      this.loading = false;
      this.$nextTick(async () => {
      });
    },
    removeOlimpiada(indexOlimpiada) {
      this.loading = true;
      this.form.olimpiadas.splice(indexOlimpiada, 1);
      this.loading = false;
    },
    removeOption(indexOlimpiada, indexRol) {
      this.loading = true;
      this.form.olimpiadas[indexOlimpiada].usuarioRol.splice(indexRol, 1);
      this.loading = false;
    },
    changeState(indexOlimpiada, indexRol, valor) {
      this.loading = true;
      this.form.olimpiadas[indexOlimpiada].usuarioRol[indexRol].estado = valor ? 'ACTIVO' : 'INACTIVO';
      this.loading = false;
    },

    changeRol(indexOlimpiada, indexRol, idRol) {
      this.loading = true;
      const camposTemp = this.obtenerCampos(this.obtenerNombre(idRol));
      if (camposTemp) {
        if (camposTemp.includes('idDistrito')) {
          camposTemp.unshift('idDepartamento');
        }
      }
      this.form.olimpiadas[indexOlimpiada].usuarioRol[indexRol].campos = Array.from(new Set(camposTemp));
      this.loading = false;
    },

    /// Método que asigna la propiedad de la olimpiada en el cambio de olimpiada
    async changeOlimpiada(indexOlimpiada, idOlimpiada) {
      this.loading = true;
      this.form.olimpiadas[indexOlimpiada].olimpiada = this.olimpiadas.find(olimpiada => olimpiada.id === idOlimpiada);
      this.form.olimpiadas[indexOlimpiada].etapas = await this.cargarEtapas(idOlimpiada);
      this.form.olimpiadas[indexOlimpiada].usuarioRol = [];
      this.addOption(0);
      this.loading = false;
    },

    async cargarRoles() {
      await this.$service.get('roles?filtro=permisoCrear:HABILITADO')
        .then((resultado) => {
          this.roles = resultado && resultado.datos ? resultado.datos : [];
        });
    },

    crearGruposRoles(rolesEntrada) {
      const gruposUnicosSet = new Map();

      rolesEntrada.map(rol => ({
        grupo: rol.grupo
      }))
        .forEach((item) => {
          gruposUnicosSet.set(JSON.stringify(item), item);
        });

      const gruposUnicos = [...gruposUnicosSet.values()];

      const rolesFinal = [];

      gruposUnicos.forEach(grupoUnico => {
        rolesFinal.push({ header: grupoUnico.grupo });
        rolesFinal.push(...rolesEntrada.filter(rol => rol.grupo === grupoUnico.grupo));
        rolesFinal.push({ divider: true });
      });

      return rolesFinal;
    },

    async actualizarOlimpiada(idOlimpiadaSeleccionadaNueva) {
      this.olimpiadaSeleccionada = this.olimpiadas.find(item => item.id === idOlimpiadaSeleccionadaNueva);
      this.idOlimpiadaSeleccionada = idOlimpiadaSeleccionadaNueva;

      if (this.olimpiadaSeleccionada != null) {
        this.$storage.set('olimpiadaSeleccionada', this.olimpiadaSeleccionada);
      }

      this.filters = this.definirFiltros();

      setTimeout(() => {
        this.updateList();
      }, 100);
    },

    async cargarRolesFiltro() {
      await this.$service.get('roles?filtro=permisoCrear:HABILITADO')
        .then((resultado) => {
          this.roles = resultado && resultado.datos ? resultado.datos : [];
          this.filters = this.definirFiltros();
          this.showCrudTable = true;
          setTimeout(() => {
            this.updateList();
          }, 100);
        });
    },

    definirFiltros() {
      return [
        {
          field: 'filtro',
          type: 'text',
          label: 'Filtro',
        },
        {
          field: 'olimpiada',
          type: 'array',
          init: this.idOlimpiadaSeleccionada,
          multiple: false,
          label: 'Olimpiadas',
          eventName: 'cambioOlimpiadas',
          onChange: this.actualizarOlimpiada,
          values: this.olimpiadas.map(olimpiada => ({
            text: olimpiada.nombre,
            value: olimpiada.id
          })),
        },
        {
          field: 'rol',
          type: 'array',
          multiple: true,
          label: 'Roles',
          values: this.roles.map(rol => ({
            text: rol.nombre,
            value: rol.id
          })),
        },
      ];
    },

    async cargarEtapas(idOlimpiada) {
      let etapasTemp = [];
      await this.$service.get(`olimpiadas/${idOlimpiada}/etapas`)
        .then((resultado) => {
          etapasTemp = resultado && resultado.datos && resultado.datos.filas ? resultado.datos.filas : [];
        });
      return etapasTemp;
    },

    async cargarDistritosForm(indexOlimpiada, indexRol, idDepartamento) {
      try {
        this.loading = true;
        this.form.olimpiadas[indexOlimpiada].usuarioRol[indexRol].distritos = await this.cargarDistritos(idDepartamento);
      } catch (error) {
        console.warning(error);
      } finally {
        console.log('termino');
        this.loading = false;
      }
    },

    async cargarDistritos(idDepartamento) {
      let distritosTemp = [];
      await this.$service.get(`distritos?filtro=idDepartamento:${idDepartamento ?? this.form.idDepartamento ?? ''},${this.searchTermDistrito != null ? `nombre:${this.searchTermDistrito}` : ''}`)
        .then((resultado) => {
          distritosTemp = resultado && resultado.datos && resultado.datos.filas ? resultado.datos.filas : [];
        });
      return distritosTemp;
    },

    async cargarUnidadesEducativasForm(indexOlimpiada, indexRol) {
      try {
        this.loading = true;
        this.form.olimpiadas[indexOlimpiada].usuarioRol[indexRol].unidadesEducativas = await this.cargarUnidadesEducativas();
      } catch (error) {
        console.warning(error);
      } finally {
        console.log('termino UE');
        this.loading = false;
      }
    },

    async cargarUnidadesEducativas() {
      let unidadesEducativasTemp = [];
      await this.$service.get(`unidades-educativas?filtro=nombre:${this.searchTermUnidadEducativa ?? ''}`)
        .then((resultado) => {
          unidadesEducativasTemp = resultado && resultado.datos && resultado.datos.filas ? resultado.datos.filas : [];
        });
      return unidadesEducativasTemp;
    },
    reset() {
      this.olimpiadasOpciones = [];
      this.form = {
        id: null,
        usuario: null,
        estado: 'ACTIVO',
        persona: {
          id: null,
          nombres: null,
          primerApellido: null,
          segundoApellido: null,
          nroDocumento: null,
          fechaNacimiento: null,
          telefono: null,
        },
        actor: false,
        ciudadaniaDigital: false,
        idOlimpiada: null,
        idEtapa: null,
        idArea: null,
        idDepartamento: null,
        idUnidadEducativa: null,
        roles: [],
        rolesID: [],
      };
      this.searchTermUnidadEducativa = null;
      this.searchTermDistrito = null;
    },
    obtenerPersona(value) {
      this.form.persona = value;
    },
    async itemDelete({ items }) {
      const { rol } = this.$storage.get('rol');
      const permitido = await this.$check(rol, '/usuarios', 'update');
      if (!permitido) {
        this.$message.warning('No tiene permisos');
        return;
      }
      const message = `¿Está seguro de ${items.estado === 'INACTIVO' ? 'activar' : 'inactivar'} al usuario con C.I. ${items.nroDocumento}?`;
      this.$confirm(
        message,
        async () => {
          const response = await this.$service.patch(`${this.url}/${items.estado === 'INACTIVO' ? 'activacion' : 'inactivacion'}/${items.id}`);
          if (response.isOK) {
            this.updateList();
            this.closeModal();
            this.$message.success(`Usuario ${items.estado === 'INACTIVO' ? 'activado' : 'inactivado'} satisfactoriamente`);
          } else {
            this.$message.error(response.message ?? response.mensaje ?? 'Ocurrio un error');
          }
        },
        () => {
        }
      );
    },
    closeModal() {
      this.reset();
      this.modalUsuario = false;
    },
    async oModal({ items }) {
      if (items && items.id) {
        const detallesUsuario = await this.$service.get(`${this.url}/${items.id}`);
        if (!detallesUsuario || !detallesUsuario.finalizado) {
          this.$message.warning('No se pudo recuperar los roles de usuario');
          return;
        }
        this.form = detallesUsuario.datos.pop();

        console.log(`this.form modal: ${JSON.stringify(this.form)}`);

        for await (const olimpiada of this.form.olimpiadas) {
          olimpiada.editar = false;
          olimpiada.etapas = await this.cargarEtapas(olimpiada.olimpiada.id);
          for await (const rol of olimpiada.usuarioRol) {
            rol.editar = false; // asignando flag para no editar el registro
            rol.esActivo = rol.estado === 'ACTIVO'; // flag para determinar si el estado es activo
            rol.campos = this.obtenerCampos(rol.rol.rol);
            if (rol.distrito) {
              if (rol.campos == null) {
                rol.campos = [];
              }
              rol.campos.unshift('idDepartamento');
              rol.idDepartamento = rol.distrito.departamento.id;

              rol.distritos = [{
                id: rol.distrito.id,
                nombre: rol.distrito.nombre
              }];
            }
            if (rol.unidadEducativa) {
              rol.unidadesEducativas = [rol.unidadEducativa];
            }
          }
        }
      } else {
        this.reset();
        this.addOptionOlimpiada();
        this.addOption(0);
      }
      this.modalUsuario = true;
    },
    async passwordRecovery(id) {
      const message = '¿Está seguro de restablecer la contraseña de este usuario?';
      this.$confirm(
        message,
        async () => {
          try {
            const response = await this.$service.patch(`${this.url}/contrasena/${id}`, {});
            this.$message.success(response.mensaje);
          } catch (error) {
            this.$message.error(error.mensaje ?? error.message ?? 'Error al restablecer contraseña');
          } finally {
            this.closeModal();
            this.updateList();
          }
        }
      );
    },
    async activateUser(id) {
      const message = '¿Está seguro de activar la cuenta del usuario?';
      this.$confirm(
        message,
        async () => {
          try {
            const response = await this.$service.patch(`${this.url}/activacion/${id}`, {});
            this.closeModal();
            this.updateList();
            this.$message.success(response.mensaje);
          } catch (error) {
            this.closeModal();
            this.$message.error(error.mensaje ?? 'Error al tratar de activar la cuenta de usuario');
          }
        }
      );
    },

    obtenerNombre(idRol) {
      let nombreRol = null;
      const rolEncontrado = this.roles.filter(rol => rol.id === idRol);
      if (rolEncontrado != null) {
        if (rolEncontrado.length > 0) {
          nombreRol = rolEncontrado[0].rol;
        }
      }
      return nombreRol;
    },

    obtenerCampos(rolBuscar) {
      let camposRolEncontrado = [];
      const rolEncontrado = this.roles.find(rol => rol.rol === rolBuscar);
      if (rolEncontrado != null) {
        camposRolEncontrado = rolEncontrado.campos;
      }
      return Array.from(new Set(camposRolEncontrado));
    },

    async save() {
      const dataOlimpiadas = [];
      if (this.form) {
        if (!this.$refs.form.validate()) {
          this.$message.error('Complete los campos obligatorios');
          return;
        }

        /// Validación roles vacios por olimpiada
        let indicadorRolVacio = false;
        let nombreOlimpiadaVacia = '';
        this.form.olimpiadas.forEach((olimpiada) => {
          if (olimpiada.usuarioRol.length === 0) {
            nombreOlimpiadaVacia = olimpiada.olimpiada.nombre;
            indicadorRolVacio = true;
          }
        });
        if (indicadorRolVacio) {
          this.$message.error(`No se puede crear olimpiadas sin roles (${nombreOlimpiadaVacia})`);
          return;
        }

        /// Agrupando por id olimpiada

        this.form.olimpiadas.forEach(olimpiadaIterar => {
          if (this.form.olimpiadas.filter(olimpiada => olimpiada.olimpiada.id === olimpiadaIterar.olimpiada.id).lenght === 1) { // verificando si hay solo una olimpiada
            if (!dataOlimpiadas.some(olimpiada => olimpiada.olimpiada.id === olimpiadaIterar.olimpiada.id)) { // verificando si esta guardado
              dataOlimpiadas.push(olimpiadaIterar);
            }
          } else {
            if (!dataOlimpiadas.some(olimpiada => olimpiada.olimpiada.id === olimpiadaIterar.olimpiada.id)) { // verificando si esta guardado
              let rolesAgrupados = [];
              this.form.olimpiadas.filter(olimpiada => olimpiada.olimpiada.id === olimpiadaIterar.olimpiada.id)
                .forEach(olimpiada => {
                  rolesAgrupados = [...rolesAgrupados, ...olimpiada.usuarioRol]; /// agrupando roles de olimpiadas repetidas
                });
              dataOlimpiadas.push({ ...olimpiadaIterar, ...{ usuarioRol: rolesAgrupados } }); /// olimpiada con roles agrupados
            }
          }
        });

        /// Validación para no tener roles repetidos
        let indicadorRolRepetido = false;
        let nombreOlimpiada = '';
        dataOlimpiadas.forEach((olimpiada) => {
          const counts = {};
          olimpiada.usuarioRol.forEach((rol) => { // contando repeticiones
            counts[`${olimpiada.olimpiada.id}-${rol.idRol}`] = (counts[`${olimpiada.olimpiada.id}-${rol.idRol}`] || 0) + 1;
          });

          Object.keys(counts)
            .forEach((key) => {
              if (parseInt(counts[key]) > 1) {
                console.log(`${counts[key]} es mayor a 1`);
                nombreOlimpiada = olimpiada.olimpiada.nombre;
                indicadorRolRepetido = true;
              }
            });
        });
        if (indicadorRolRepetido) {
          this.$message.error(`No se puede tener más de un rol repetido por olimpiada (${nombreOlimpiada})`);
          return;
        }
      }
      this.$confirm('¿ Esta seguro de guardar los cambios ?', async () => {
        // const data = { ...this.form };
        const data = { ...this.form, ...{ olimpiadas: dataOlimpiadas } };

        data.persona.fechaNacimiento = moment(data.persona.fechaNacimiento, 'DD-MM-YYYY', 'es')
          .format('YYYY-MM-DD');

        if (data?.persona?.telefono) {
          data.persona.telefono = Number(data.persona.telefono);
        } else {
          data.persona.telefono = null;
        }

        data.roles = data.olimpiadas;
        delete data.olimpiadas;

        data.roles = data.roles.map(rol => ({
          idOlimpiada: rol.olimpiada.id,
          usuarioRoles: rol.usuarioRol,
          ...rol
        }));

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
          try {
            if (this.usarCiudadaniaCheckBox) {
              data.usuario = data.persona.nroDocumento;
              delete data.id;
              delete data.estado;
              delete data.persona;
            }
            const response = await this.$service.post(`${this.url}${this.usarCiudadaniaCheckBox ? '/ciudadania' : ''}`, data);
            if (response.isOK) {
              this.closeModal();
              this.updateList();
              this.$message.success('El registro fue agregado correctamente');
            } else {
              this.$message.error(
                response.mensaje ?? 'Ocurrio un error al tratar de enviar la data'
              );
            }
          } catch (error) {
            this.$message.error(error.mensaje ?? 'Ocurrio un error al tratar de enviar la data');
          }
        }
      });
    },
    deshabilitarAgregarRol(idxOlimpiada) {
      return this.form.olimpiadas.length > 0
        ? this.form.olimpiadas[idxOlimpiada].usuarioRol.filter(rol => rol.idRol === '' || rol.idRol === null).length > 0
        : true;
    },
    deshabilitarAgregarOlimpiada() {
      return this.form.olimpiadas.length > 0
        ? this.form.olimpiadas.filter(olimpiada => olimpiada.id === '' || olimpiada.id === null).length > 0
        : true;
    }
  },
  computed: {},
  components: {
    AppDialog,
    CrudTable,
    FormPersona,
    vIconComponent
  },
};
</script>
