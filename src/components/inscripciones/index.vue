<template>
  <v-card elevation="0">
    <!-- SLOT PARA EL FORMULARIO -->
    <app-dialog
      :dialog.sync="modalInscripcion"
      :titulo="form.id ? 'Editar inscripción' : 'Adicionar inscripción'"
      @open-dialog="modalInscripcion = true;"
      @close-dialog="closeModal()"
      @accion="save"
      :wait="wait"
      max-width="700"
    >
      <template v-if="modalInscripcion">
        <!-- FORMULARIO PARA AGREGAR O EDITAR -->
        <v-form :key="`inscripción-${form.id}`" ref="form" v-model="valid" lazy-validation @submit.prevent="save">
          <v-card elevation="0" class="pa-3">
            <v-container fluid v-if="modalInscripcion">
              <v-row>
                <v-col cols="12" md="6" xs="12" sm="12" lg="">
                  <v-input-text-field

                      label="Etapa Área Grado"
                      dense
                  >
                    <template slot="contenido">
                      <v-select
                          color="primary"
                          required
                          readonly
                          disabled
                          dense
                          item-color="primary"
                          v-model="form.idEtapaAreaGrado"
                          :items="areas"
                          item-value="id"
                          outlined
                          hide-details
                          :rules="$validate(['required'])"
                      >
                        <template slot="item" slot-scope="data">
                          Etapa: {{ data.item.etapa.nombre }} - Área: {{ data.item.area.nombre }} - Grado:
                          {{ data.item.gradoEscolar.nombre }}
                        </template>
                        <template slot="selection" slot-scope="data">
                          Etapa: {{ data.item.etapa.nombre }} - Área: {{ data.item.area.nombre }} - Grado:
                          {{ data.item.gradoEscolar.nombre }}
                        </template>
                      </v-select>
                    </template>
                  </v-input-text-field>
                </v-col>
              </v-row>
              <v-card elevation="0" class="primary--text mb-4 mt-5">Datos de estudiante</v-card>
              <v-row>
                <v-col cols="12" md="6" xs="12" sm="12" lg="">
                  <v-input-text-field

                      label="Unidad Educativa"
                      dense
                  >
                    <template slot="contenido">
                      <v-select
                          v-model="form.idUnidadEducativa"
                          item-text="nombre"
                          item-value="id"
                          :items="unidadesEducativas"
                          attach
                          outlined
                          dense
                          :rules="$validate(['required'])">
                        <template slot="selection" slot-scope="data">
                            <v-list-item dense>
                              <v-list-item-content>
                                <v-list-item-title>{{ data.item.nombre }}</v-list-item-title>
                                <v-list-item-subtitle>{{ data.item.codigoSie }} - {{ data.item.distrito.departamento.nombre }}</v-list-item-subtitle>
                              </v-list-item-content>
                            </v-list-item>
                        </template>
                        <template slot="item" slot-scope="data">
                          <v-list dense>
                            <v-list-item>
                              <v-list-item-content>
                                <v-list-item-title>{{ data.item.nombre }}</v-list-item-title>
                                <v-list-item-subtitle>{{ data.item.codigoSie }} - {{ data.item.distrito.departamento.nombre }}</v-list-item-subtitle>
                              </v-list-item-content>
                            </v-list-item>
                          </v-list>
                        </template>
                        <template v-slot:prepend-item>
                          <v-list-item>
                            <v-list-item-content>
                              <v-text-field
                                  dense
                                  v-model="searchTermUnidadEducativa"
                                  placeholder="Buscar Unidad Educativa"
                                  @input="cargarUnidadesEducativas"></v-text-field>
                            </v-list-item-content>
                          </v-list-item>
                          <v-divider class="mt-2"></v-divider>
                        </template>
                      </v-select>
                    </template>
                  </v-input-text-field>
                </v-col>
              </v-row>
              <v-row>
                <v-col cols="12" md="6" xs="12" sm="12" lg="">
                  <v-input-text-field
                      label="Rude"
                      dense
                  >
                    <template slot="contenido">
                      <v-text-field
                          dense
                          color="primary"
                          required
                          :rules="$validate(['required'])"
                          v-model="estudiante.rude"
                          outlined
                          hide-details
                          @keyup="estudiante.rude = $util.textToUppercase(estudiante.rude)"
                          @input="obtenerDatosEstudiante(estudiante.rude)"
                      ></v-text-field>
                    </template>
                  </v-input-text-field>
                  <i v-if="messageSearch">Buscando ...</i>
                </v-col>
              </v-row>
              <v-row>
                <v-col cols="12" md="12" xs="12" sm="12" lg="6">
                  <v-input-text-field
                      label="Número de Documento"
                      dense
                  >
                    <template slot="contenido">
                      <v-text-field
                          dense
                          color="primary"
                          required
                          :rules="$validate(['required', 'alfanumerico'])"
                          v-model="persona.nroDocumento"
                          hide-details
                          :disabled="bloquearEdicionPersona"
                          outlined
                          @keyup="persona.nroDocumento = $util.textToUppercase(persona.nroDocumento)"
                      ></v-text-field>
                    </template>
                  </v-input-text-field>
                </v-col>
                <v-col cols="12" md="12" xs="12" sm="12" lg="6">
                  <v-input-text-field
                      label="Nombres"
                      dense
                  >
                    <template slot="contenido">
                      <v-text-field
                          dense
                          color="primary"
                          required
                          :rules="$validate(['required', 'alfanumerico'])"
                          v-model="persona.nombres"
                          outlined
                          hide-details
                          @keyup="persona.nombres = $util.textToUppercase(persona.nombres)"
                      ></v-text-field>
                    </template>
                  </v-input-text-field>
                </v-col>
                <v-col cols="12" md="12" xs="12" sm="12" lg="6">
                  <v-input-text-field

                      label="Primer Apellido"
                      dense
                  >
                    <template slot="contenido">
                      <v-text-field
                          dense
                          color="primary"
                          required
                          v-model="persona.primerApellido"
                          outlined
                          hide-details
                          @keyup="persona.primerApellido = $util.textToUppercase(persona.primerApellido)"
                      ></v-text-field>
                    </template>
                  </v-input-text-field>
                </v-col>
                <v-col cols="12" md="12" xs="12" sm="12" lg="6">
                  <v-input-text-field

                      label="Segundo Apellido"
                      dense
                  >
                    <template slot="contenido">
                      <v-text-field
                          dense
                          color="primary"
                          required
                          v-model="persona.segundoApellido"
                          outlined
                          hide-details
                          @keyup="persona.segundoApellido = $util.textToUppercase(persona.segundoApellido)"
                      ></v-text-field>
                    </template>
                  </v-input-text-field>
                </v-col>
              </v-row>
              <v-row v-if="this.modalInscripcion">
                <v-col cols="12" md="12" xs="12" sm="12" lg="6">
                  <v-input-text-field

                      label="Género"
                      dense
                  >
                    <template slot="contenido">
                      <v-select
                          dense
                          color="primary"
                          required
                          item-color="primary"
                          v-model="persona.genero"
                          :items="enumGenero"
                          item-text="nombre"
                          item-value="id"
                          outlined
                          hide-details
                          :rules="$validate(['required'])"
                      ></v-select>
                    </template>
                  </v-input-text-field>
                </v-col>
                <v-col cols="12" md="12" xs="12" sm="12" lg="6">
                  <v-input-text-field

                      label="Fecha Nacimiento"
                      dense
                  >
                    <template slot="contenido">
                      <date-input
                          :fecha.sync="persona.fechaNacimiento"
                          :tabIndex="5"
                          min-date="1950-01-01"
                          required
                          :readonly="form.id!=null"
                          @value="obtenerFecha"
                      ></date-input>
                    </template>
                  </v-input-text-field>
                </v-col>
              </v-row>
              <v-row>
                <v-col cols="12" md="6" xs="12" sm="12" lg="">
                  <v-input-text-field

                      label="Celular"
                      dense
                  >
                    <template slot="contenido">
                      <v-text-field
                          dense
                          color="primary"
                          v-model="persona.telefono"
                          :rules="$validate(['celular'])"
                          outlined
                          maxlength="8"
                      ></v-text-field>
                    </template>
                  </v-input-text-field>
                </v-col>
              </v-row>
              <v-row>
                <v-col cols="12" md="6" xs="12" sm="12" lg="">
                  <v-input-text-field

                      label="Correo electrónico"
                      dense
                  >
                    <template slot="contenido">
                      <v-text-field
                          dense
                          color="primary"
                          :rules="$validate(['email'])"
                          v-model="persona.correoElectronico"
                          outlined
                      ></v-text-field>
                    </template>
                  </v-input-text-field>
                </v-col>
              </v-row>
              <v-row>
                <v-col cols="12" md="6" xs="12" sm="12" lg="">
                  <v-input-text-field

                      label="Identificador de importación"
                      dense
                  >
                    <template slot="contenido">
                      <v-text-field
                          dense
                          placeholder="Identificador de importación de la inscripción proporcionado por Min. Edu."
                          color="primary"
                          :rules="$validate(['required', 'numeros'])"
                          v-model="form.idImportacion"
                          outlined
                      ></v-text-field>
                    </template>
                  </v-input-text-field>
                </v-col>
              </v-row>
            </v-container>
          </v-card>
        </v-form>
      </template>
    </app-dialog>
    <app-dialog :dialog.sync="modalSubirInscripcion"
                titulo="Subir inscripción"
                @open-dialog="modalSubirInscripcion = true;"
                @close-dialog="modalSubirInscripcion = false;"
                :mostrar-acciones="false"
    >
      <v-card class="pa-2 d-flex flex-column align-center justify-center pl-0 pr-0" elevation="0">
        <v-container>
          <v-row>
            <v-col cols="12" md="12" xs="12" sm="12" lg="12">
              <v-select
                  color="primary"
                  required
                  readonly
                  disabled
                  item-color="primary"
                  v-model="form.idEtapaAreaGrado"
                  label="Etapa-Área-Grado Seleccionada: "
                  :items="areas"
                  item-value="id"
                  outlined
                  hide-details
                  :rules="$validate(['required'])"
              >
                <template slot="item" slot-scope="data">
                  Etapa: {{ data.item.etapa.nombre }} - Área: {{ data.item.area.nombre }} - Grado:
                  {{ data.item.gradoEscolar.nombre }}
                </template>
                <template slot="selection" slot-scope="data">
                  Etapa: {{ data.item.etapa.nombre }} - Área: {{ data.item.area.nombre }} - Grado:
                  {{ data.item.gradoEscolar.nombre }}
                </template>
              </v-select>
              <v-file-upload
                @close="closeModalsubir"
                :key="new Date().getTime() / 1000"
                :id-eag="form.idEtapaAreaGrado" @close-dialog="modalSubirInscripcion = false;"
                @recargar="updateList"/>
            </v-col>
          </v-row>
        </v-container>
      </v-card>
    </app-dialog>
    <app-dialog
      :dialog.sync="modalReinicio"
      :titulo="`Examenes de ${tituloReinicio}`"
      @open-dialog="modalReinicio = true;"
      @close-dialog="modalReinicio = false; urlReinicio = null"
      max-width="800px"
      :mostrarAcciones="false"
    >
      <v-card style="overflow-x: hidden">
        <Reiniciar v-if="urlReinicio" :urlReinicio="urlReinicio" :student="student" :parametros="parametros"/>
      </v-card>
    </app-dialog>
    <crud-table
        v-if="showCrudTable"
        :headers="headers"
        description="Inscripciones"
        :url.sync="url"
        :widthModal="500"
        :show-filter-init="true"
        :filters.sync="filters"
        :order="order"
        :custom="true"
        :show-filter-options="false"
        :omitir-carga-on-mounted="true"
    >
      <template slot="buttons">
        <v-icon-tooltip
            v-if="btnAgregar"
            color="primary"
            icon="file_upload"
            :disabled="bloquearAcciones"
            @accion="oModalUpload({})"
            text="Subir lista de estudiantes"
        />
        <v-icon-tooltip
            v-if="btnAgregar"
            color="primary"
            icon="add"
            :disabled="bloquearAcciones"
            @accion="oModal({})"
            text="Agregar inscripción"
        />
      </template>
      <template slot="items" slot-scope="items">
        <tr>

          <td>{{ items.items.estudiante.persona.nroDocumento }}</td>
          <td>
            {{ items.items.estudiante.persona.nombres }}
            {{ items.items.estudiante.persona.primerApellido }}
            {{ items.items.estudiante.persona.segundoApellido }}<br>
            {{
              formatFechaValidar(items.items.estudiante.persona.fechaNacimiento, 'YYYY-MM-DD', 'DD-MM-YYYY')
            }}
          </td>
          <td>{{ items.items.estudiante.rude }}</td>
          <td>
            {{ items.items.unidadEducativa.nombre }}<br>
            {{ items.items.unidadEducativa.codigoSie }}
          </td>
          <td>
            {{ items.items.etapaAreaGrado.gradoEscolar.nombre }}
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
            <v-icon-tooltip
                v-if="btnEditar && items.items.estado === 'ACTIVO'&& items.items.etapaAreaGrado.etapa.estado !== 'CIERRE_PREGUNTAS'"
                color="info"
                icon="toggle_on"
                text="Inactivar"
                @accion="inactivar(items.items)"
            />
            <v-icon-tooltip
                color="primary"
                icon="find_in_page"
                :text="`Buscar examenes de ${ items.items.estudiante.persona.nombres } para reiniciar`"
                @accion="handleClickSearchUser(items.items)"
            />
            <v-icon-tooltip
                v-if="btnEditar && (items.items.estado === 'INACTIVO'&& items.items.etapaAreaGrado.etapa.estado !== 'CIERRE_PREGUNTAS')"
                color="error"
                icon="toggle_off"
                text="Activar"
                @accion="activar(items.items)"
            />
            <v-icon-tooltip
                v-if="btnEditar && (items.items.estado === 'ACTIVO' && items.items.etapaAreaGrado.etapa.estado === 'CONFIGURACION_COMPETENCIA')"
                color="success"
                icon="edit"
                text="Editar registro"
                @accion="oModal(items)"
            />
          </td>
        </tr>
      </template>
    </crud-table>
    <v-alert
        type="warning"
        dense
        text
        class="fs9"
        v-else
    >
      No existen áreas asignadas en esta competencia.
    </v-alert>
  </v-card>
</template>
<script>

import { mapState } from 'vuex';
import validate from '@/common/mixins/validate';
import CrudTable from '@/plugins/crud-table/CrudTable.vue';
import actions from '@/plugins/crud-table/mixins/crud-table';
import AppDialog from '@/plugins/modal/AppDialog.vue';
import vFileUpload from '@/plugins/fileUpload2/index.vue';
import DateInput from '@/plugins/date-input/DateInput.vue';
import Reiniciar from '@/components/reinicio/index.vue';
import moment from 'dayjs';

export default {
  mixins: [actions, validate],
  data: () => ({
    valid: false,
    url: null,
    urlAcciones: null,
    parametros: null,
    modalReinicio: null,
    student: {},
    wait: false,
    urlReinicio: null,
    tituloReinicio: null,
    order: ['createdAt', 'DESC'],
    headers: [
      {
        text: 'Nro. de documento',
        sortable: false,
        align: 'center'
      },
      {
        text: 'Nombres',
        sortable: false,
        align: 'center'
      },
      {
        text: 'Rude',
        sortable: false,
        align: 'center',
        value: 'rude'
      },
      {
        text: 'Unidad Educativa',
        sortable: false,
        align: 'center'
      },
      {
        text: 'Grado de escolaridad',
        sortable: false,
        align: 'center'
      },
      {
        text: 'Estado',
        sortable: false,
        align: 'center'
      },
      {
        text: 'Acciones',
        divider: false,
        sortable: false,
        align: 'center',
        value: 'ACTIONS'
      }
    ],
    form: {
      id: null,
      idImportacion: null,
      idEtapa: null,
      idArea: null,
      idGrado: null,
      idUnidadEducativa: null,
      idEtapaAreaGrado: null
    },
    showCrudTable: false,
    filters: [],
    olimpiadas: [],
    etapas: [],
    areas: [],
    estudiante: {
      id: null,
      rude: null,
    },
    idImportacion: null,
    persona: {
      nombres: null,
      primerApellido: null,
      segundoApellido: null,
      tipoDocumento: null,
      nroDocumento: null,
      fechaNacimiento: null,
      telefono: null,
      correoElectronico: null,
      genero: null,
      estado: null,
    },
    menufechaNacimiento: false,
    btnAgregar: true,
    btnEditar: true,
    btnEliminar: true,
    departamentos: [],
    etapasAreasGrados: [],
    modalInscripcion: false,
    modalSubirInscripcion: false,
    unidadesEducativas: [],
    searchTermUnidadEducativa: null,
    activeSearch: false,
    typingTimer: null,
    rudeABuscar: null,
    bloquearEdicionPersona: false,
    messageSearch: false,
    enumGenero: [
      {
        id: 'M',
        nombre: 'Masculino'
      },
      {
        id: 'F',
        nombre: 'Femenino'
      },
    ],
    bloquearAcciones: true,
  }),
  computed: {
    ...mapState(['selectedArea']),
  },
  watch: {
    activeSearch: {
      handler(value) {
        if (value) {
          this.apiEstudiante();
          this.activeSearch = false;
          this.messageSearch = false;
        }
      },
      deep: true
    }
  },
  mounted() {
    this.$nextTick(async () => {
      const { rol } = this.$storage.get('rol');
      if (this.$storage.get('etapaSeleccionada')) {
        this.btnAgregar = await this.$Casbin.enforcer.enforce(rol, '/inscripciones', 'create') && this.$storage.get('etapaSeleccionada').estado === 'CONFIGURACION_COMPETENCIA';
        this.btnEditar = await this.$Casbin.enforcer.enforce(rol, '/inscripciones', 'update') && this.$storage.get('etapaSeleccionada').estado === 'CONFIGURACION_COMPETENCIA';
        this.btnEliminar = await this.$Casbin.enforcer.enforce(rol, '/inscripciones', 'delete');
      }

      this.olimpiadaSeleccionada = this.$storage.get('olimpiadaSeleccionada');
      if (this.olimpiadaSeleccionada !== null) {
        this.idOlimpiadaSeleccionada = this.olimpiadaSeleccionada.id;
      } else {
        this.idOlimpiadaSeleccionada = null;
      }

      this.etapaSeleccionada = this.$storage.get('etapaSeleccionada');
      if (this.etapaSeleccionada !== null) {
        this.idEtapaSeleccionada = this.etapaSeleccionada.id;
      } else {
        this.idEtapaSeleccionada = null;
      }

      this.areaSeleccionada = this.$storage.get('areaSeleccionada');
      if (this.areaSeleccionada !== null) {
        this.idAreaSeleccionada = this.areaSeleccionada.id;
      } else {
        this.idAreaSeleccionada = null;
      }
      this.parametros = {
        idOlimpiada: this.idOlimpiadaSeleccionada,
        idEtapa: this.idEtapaSeleccionada,
        idEtapaAreaGrado: this.idAreaSeleccionada
      };
      this.actualizarAcciones();
      await this.loadParams();
      this.url = this.obtenerRuta();
      this.urlAcciones = 'inscripciones';
    });
  },
  methods: {
    obtenerRuta() {
      return `etapasAreaGrado/${this.idAreaSeleccionada}/inscripciones`;
    },
    actualizarAcciones() {
      this.bloquearAcciones = this.idAreaSeleccionada == null || this.etapaSeleccionada == null || this.olimpiadaSeleccionada == null;
    },
    isAuthorized() {
      return this.etapaSeleccionada ? this.etapaSeleccionada.tipo === 'DISTRITAL' : false;
    },
    async handleClickSearchUser({ estudiante: { rude,
      persona: {
        nombres,
        primerApellido,
        segundoApellido
      }
    }
    }) {
      try {
        this.tituloReinicio = `${nombres} ${primerApellido} ${segundoApellido}`;
        const response = await this.$service.get(`estudiantes/${rude}/detalles`);
        if (response && response.datos && response.isOK) {
          this.student = response.datos;
          // adrian
          this.urlReinicio = `estudiantes/${this.student.idEstudiante}/examenes/calendarios`;
          this.modalReinicio = !this.modalReinicio;
        } else {
          throw new Error('No se encontraron registros');
        }
      } catch (error) {
        this.$message.error(error.message);
      }
    },
    async cargarEtapas() {
      try {
        if (this.idOlimpiadaSeleccionada) {
          const resultado = await this.$service.get(`olimpiadas/${this.idOlimpiadaSeleccionada}/etapas`);
          if (resultado && resultado.isOK) {
            this.etapas = resultado && resultado.datos && resultado.datos.filas ? resultado.datos.filas : [];
          }
        } else {
          this.etapas = [];
        }
      } catch (error) {
        this.$message.error(error.message);
      }
    },

    async cargarAreas() {
      try {
        if (this.idEtapaSeleccionada) {
          const resultado = await this.$service.get(`etapas/${this.idEtapaSeleccionada}/etapaAreaGrados`);
          if (resultado && resultado.isOK) {
            this.areas = resultado && resultado.datos && resultado.datos.filas
              ? resultado.datos.filas
              : [];
          }
        } else {
          this.areas = [];
        }
      } catch (error) {
        this.$message.error(error.message);
      }
    },

    async loadParams() {
      try {
        const resultado = await this.$service.get('olimpiadas?limite=50&pagina=1');
        if (resultado && resultado.isOK) {
          this.olimpiadas = resultado && resultado.datos && resultado.datos.filas ? resultado.datos.filas : [];
        }
        if (this.olimpiadas.length > 0) {
          this.idOlimpiadaSeleccionada = this.olimpiadas.length > 0 ? this.olimpiadas[0].id : null;
          this.olimpiadaSeleccionada = this.olimpiadas.length > 0 ? this.olimpiadas[0] : null;
          this.$storage.set('olimpiadaSeleccionada', this.olimpiadas.length > 0 ? this.olimpiadas[0] : null);
        } else {
          this.$storage.set('olimpiadaSeleccionada', null);
          this.$storage.set('etapaSeleccionada', null);
          this.$storage.set('areaSeleccionada', null);
          this.idOlimpiadaSeleccionada = null;
          this.idEtapaSeleccionada = null;
          this.idAreaSeleccionada = null;
        }

        await this.cargarEtapas();
        if (!this.etapaSeleccionada?.id || !this.olimpiadaSeleccionada?.id) {
          this.$message.info('Debe seleccionar una olimpiada, etapa y el area');
          this.filters = this.definirFiltros();

          this.showCrudTable = true;
          setTimeout(() => {
            this.updateList();
          }, 100);
          return;
        }
        await this.$service.get('departamentos')
          .then((resultado) => {
            this.departamentos = resultado && resultado.datos ? resultado.datos : [];
          });

        await this.cargarUnidadesEducativas();

        await this.cargarAreas();

        this.filters = this.definirFiltros();

        this.showCrudTable = true;
        setTimeout(() => {
          this.updateList();
        }, 100);
      } catch (error) {
        this.$message.error(error.message);
      }
    },

    async actualizarOlimpiada(idOlimpiadaSeleccionadaNueva) {
      this.olimpiadaSeleccionada = this.olimpiadas.find(item => item.id === idOlimpiadaSeleccionadaNueva);
      this.idOlimpiadaSeleccionada = idOlimpiadaSeleccionadaNueva;
      if (this.olimpiadaSeleccionada != null) {
        this.$storage.set('olimpiadaSeleccionada', this.olimpiadaSeleccionada);
      }
      this.idEtapaSeleccionada = null;
      this.$storage.set('etapaSeleccionada', null);
      await this.cargarEtapas();

      this.idAreaSeleccionada = null;
      this.$storage.set('areaSeleccionada', null);
      this.areas = [];

      this.filters = this.definirFiltros();
      this.url = this.obtenerRuta();

      setTimeout(() => {
        this.updateList();
      }, 100);
      this.actualizarAcciones();
    },

    async actualizarEtapa(idEtapaSeleccionadaNueva) {
      this.etapaSeleccionada = this.etapas.find(item => item.id === idEtapaSeleccionadaNueva);
      this.idEtapaSeleccionada = idEtapaSeleccionadaNueva;
      console.log(`etapaSeleccionada: ${JSON.stringify(this.etapaSeleccionada)}`);
      this.$storage.set('etapaSeleccionada', this.etapaSeleccionada);
      this.$storage.set('areaSeleccionada', null);

      this.areaSeleccionada = null;
      this.idAreaSeleccionada = null;

      await this.cargarAreas();
      const { rol } = this.$storage.get('rol');
      this.btnAgregar = await this.$Casbin.enforcer.enforce(rol, '/inscripciones', 'create') && this.$storage.get('etapaSeleccionada').estado === 'CONFIGURACION_COMPETENCIA';
      this.btnEditar = await this.$Casbin.enforcer.enforce(rol, '/inscripciones', 'update') && this.$storage.get('etapaSeleccionada').estado === 'CONFIGURACION_COMPETENCIA';
      this.filters = this.definirFiltros();
      this.url = this.obtenerRuta();

      setTimeout(() => {
        this.updateList();
      }, 100);
      this.actualizarAcciones();
    },

    actualizarArea(idAreaSeleccionadaNueva) {
      this.areaSeleccionada = this.areas.find(item => item.id === idAreaSeleccionadaNueva);
      this.idAreaSeleccionada = idAreaSeleccionadaNueva;
      this.$storage.set('areaSeleccionada', this.areaSeleccionada);
      this.filters = this.definirFiltros();
      this.url = this.obtenerRuta();
      this.actualizarAcciones();
      this.parametros = {
        idOlimpiada: this.idOlimpiadaSeleccionada,
        idEtapa: this.idEtapaSeleccionada,
        idEtapaAreaGrado: this.idAreaSeleccionada,
      };
    },

    definirFiltros() {
      return [
        {
          field: 'idOlimpiada',
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
          field: 'idEtapa',
          type: 'array',
          init: this.idEtapaSeleccionada,
          multiple: false,
          label: 'Etapas',
          nowrap: true,
          eventName: 'cambioEtapas',
          onChange: this.actualizarEtapa,
          values: this.etapas.map(etapa => ({
            text: `${etapa.nombre} - ${etapa.estadoDescripcion}`,
            value: etapa.id
          })),
        },
        {
          field: 'idEtapaAreaGrado',
          type: 'array',
          init: this.idAreaSeleccionada,
          multiple: false,
          nowrap: true,
          label: 'Áreas Grado',
          eventName: 'cambioAreas',
          onChange: this.actualizarArea,
          values: this.areas.map(area => ({
            text: `${area.area.nombre} - ${area.gradoEscolar.nombre} `,
            value: area.id
          })),
        },
        {
          field: 'estudiante',
          label: 'Rude, número documento, nombres',
          type: 'text',
          typeG: 'String'
        },
      ];
    },
    async cargarUnidadesEducativas() {
      try {
        if (this.olimpiadas.length > 0) {
          const resultado = await this.$service.get(`unidades-educativas?filtro=nombre:${this.searchTermUnidadEducativa ?? ''}`);
          if (resultado && resultado.isOK) {
            this.unidadesEducativas = resultado && resultado.datos && resultado.datos.filas ? resultado.datos.filas : [];
          }
        }
      } catch (error) {
        this.$message.error(error.message);
      }
    },

    async activar(item) {
      const message = `¿Está seguro de activar a ${item.estudiante.persona.nombres} ${item.estudiante.persona.primerApellido ?? item.estudiante.persona.segundoApellido}?`;
      this.$confirm(
        message,
        async () => {
          const response = await this.$service.patch(`${this.urlAcciones}/activacion/${item.id}`, {});
          if (response.isOK) {
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
      const message = `¿Está seguro de inactivar a ${item.estudiante.persona.nombres} ${item.estudiante.persona.primerApellido ?? item.estudiante.persona.segundoApellido}?`;
      this.$confirm(
        message,
        async () => {
          const response = await this.$service.patch(`${this.urlAcciones}/inactivacion/${item.id}`, {});
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
        idImportacion: null,
        idEtapa: null,
        idArea: null,
        idGrado: null,
        idUnidadEducativa: null,
        idEtapaAreaGrado: null,
      };
      this.searchTermUnidadEducativa = null;
      this.estudiante = {
        id: null,
        rude: null,

      };
      this.persona = {
        nombres: null,
        primerApellido: null,
        segundoApellido: null,
        tipoDocumento: null,
        nroDocumento: null,
        fechaNacimiento: null,
        telefono: null,
        correoElectronico: null,
        genero: null,
        estado: null,
      };
    },

    async itemDelete({ items }) {
      // Verificar permiso para ejecutar esta funcion
      if (this.$Casbin && this.$Casbin.enforcer) {
        const { rol } = this.$storage.get('rol');
        const permitido = await this.$Casbin.enforcer.enforce(rol, '/inscripciones', 'delete');
        if (!permitido) {
          this.$message.warning('No tiene permisos');
          return;
        }
      }
      const message = '¿Está seguro de eliminar este registro?';
      this.$confirm(
        message,
        async () => {
          const response = await this.$service.delete(`${this.urlAcciones}/${items.id}`);
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
      this.modalInscripcion = false;
      this.reset();
    },
    closeModalsubir() {
      this.modalSubirInscripcion = false;
      this.reset();
    },
    formatFechaValidar(dateOriginal, formato, formatoNuevo) {
      if (moment(dateOriginal, formato, 'es')
        .isValid()) {
        return moment(dateOriginal, formato)
          .format(formatoNuevo);
      } else {
        return dateOriginal;
      }
    },
    formatFecha(dateOriginal, formato = 'DD/MM/YYYY') {
      return dateOriginal ? this.$datetime.format(formato, dateOriginal) : '';
    },
    async oModal({ items }) {
      if (items && items.id) {
        this.bloquearEdicionPersona = true;
        this.form = { ...items };
        this.estudiante = { ...items.estudiante };
        this.persona = { ...items.estudiante.persona };
        this.form.idUnidadEducativa = items.unidadEducativa.id;
        this.form.idEtapaAreaGrado = items.etapaAreaGrado.id;
        this.persona.fechaNacimiento = this.formatFecha(
          this.persona.fechaNacimiento,
          'DD-MM-YYYY'
        );
        this.searchTermUnidadEducativa = null;
        this.unidadesEducativas = [items.unidadEducativa];
      } else {
        this.bloquearEdicionPersona = false;
        console.log(`modal con area: ${this.idAreaSeleccionada}`);
        this.reset();
        this.form.idEtapaAreaGrado = this.idAreaSeleccionada;
        await this.cargarUnidadesEducativas();
      }
      this.modalInscripcion = true;
    },
    async oModalUpload() {
      this.form = {
        ...this.form,
        idEtapaAreaGrado: this.idAreaSeleccionada
      };
      this.modalSubirInscripcion = true;
    },

    /**
     * @function save
     * @description Esta funcion esta creada para guardar en la BD
     * @author dbarra@agetic.gob.bo
     */
    async save() {
      if (this.$refs.form.validate()) {
        this.wait = true;
        const data = {
          ...this.form,
          estudiante: {
            ...this.estudiante,
            persona: { ...this.persona }
          }
        };
        data.estudiante.persona.fechaNacimiento = this.formatFechaValidar(data.estudiante.persona.fechaNacimiento, 'DD-MM-YYYY', 'YYYY-MM-DD');
        if (data.id) {
          const response = await this.$service.patch(`${this.urlAcciones}/${data.id}`, data);
          if (response.isOK) {
            this.closeModal();
            this.updateList();
            this.$message.success('Se actualizó el registro correctamente');
          } else {
            this.$message.error(response.mensaje ?? 'Ocurrio un error al tratar de enviar la data');
          }
        } else {
          delete data.id;
          const response = await this.$service.post(this.urlAcciones, data);
          if (response.isOK) {
            this.closeModal();
            this.updateList();
            if (response.finalizado) {
              this.$message.success('El registro fue agregado correctamente');
            }
          } else {
            console.info(`Error: ${response}`);
            this.$message.error(response.mensaje ?? 'Ocurrio un error al tratar de enviar la data');
          }
        }
        this.wait = false;
      } else {
        this.wait = false;
        this.$message.error('Complete los campos obligatorios');
      }
    },
    obtenerFecha(val) {
      this.persona.fechaNacimiento = val;
    },
    async obtenerDatosEstudiante(rude) {
      if (typeof rude === 'string' && rude.trim() === '') {
        return;
      }
      this.messageSearch = true;
      this.bloquearEdicionPersona = false;
      rude = rude.trim();
      clearTimeout(this.typingTimer);
      this.typingTimer = setTimeout(async () => {
        this.activeSearch = true;
        this.rudeABuscar = rude;
      }, 500);
    },
    async apiEstudiante() {
      try {
        const response = await this.$service.get(`estudiantes/${this.rudeABuscar.toUpperCase()}/detalles`);
        if (response && response.datos && response.datos.idEstudiante) {
          this.persona.nombres = response.datos.nombres;
          this.persona.primerApellido = response.datos.primerApellido;
          this.persona.segundoApellido = response.datos.segundoApellido;
          this.persona.genero = response.datos.genero;
          this.persona.fechaNacimiento = this.formatFecha(
            response.datos.fechaNacimiento,
            'DD-MM-YYYY'
          );
          this.persona.nroDocumento = response.datos.nroDocumento;
          this.persona.telefono = response.datos.telefono;
          this.persona.correoElectronico = response.datos.correoElectronico;
          this.bloquearEdicionPersona = true;
        } else {
          this.persona.nombres = '';
          this.persona.primerApellido = '';
          this.persona.segundoApellido = '';
          this.persona.genero = '';
          this.persona.fechaNacimiento = '';
          this.persona.nroDocumento = '';
          this.persona.telefono = '';
          this.persona.correoElectronico = '';
          this.bloquearEdicionPersona = false;
        }
      } catch (error) {
        this.$message.error(error.message);
      }
    },
  },
  components: {
    CrudTable,
    AppDialog,
    vFileUpload,
    DateInput,
    Reiniciar
  }
};
</script>
