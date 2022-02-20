<template>
  <v-card elevation="0">
    <app-dialog
        :dialog.sync="modalPreguntas"
        :titulo="form.id ? viewDetail ? 'Revisando la pregunta' : 'Editar pregunta' : 'Adicionar pregunta'"
        @open-dialog="wait = false; modalPreguntas = true; aOpciones = []; observed = null; state = null; reviewingToApprove = null"
        @close-dialog="wait = false; modalPreguntas = false; aOpciones = []; observed = null; state = null; reviewingToApprove = null"
        :textoEjecutar="state === ESTADO_OBSERVADO ? 'Enviar al comite verificador' : reviewingToApprove ? 'Aprobar' : observed ? 'Observar y enviar al comite de carga' : form.id ? 'Guardar cambios' : 'Guardar pregunta creada'"
        btnActions="column"
        :mostrarAcciones="!viewDetail"
        :icono="viewDetail ? 'visibility' : form.id ? 'edit' : 'add'"
        @accion="save"
        :wait="wait"
        max-width="800px"
    >
      <template v-if="modalPreguntas">
        <!-- FORMULARIO PARA AGREGAR O EDITAR -->
        <v-form ref="form" v-model="valid" lazy-validation @submit.prevent="save">
          <v-card elevation="0">
            <v-container fluid>
              <v-row>
                <v-col cols="12" class="pb-0">
                  <v-input-select
                    @value="e => form.tipoPregunta = e"
                    item-color="primary"
                    required
                    :init="form.tipoPregunta"
                    :autofocus="!form.id"
                    v-model="form.tipoPregunta"
                    label="Tipo de pregunta (*)"
                    color="primary"
                    :items="aTiposPreguntas"
                    item-text="label"
                    outlined
                    :disabled="viewDetail"
                    dense
                    item-value="value"
                    :rules="[(val) => !!val || 'No puede estar vacio']"
                  ></v-input-select>
                </v-col>
                <v-col cols="12" class="pb-0">
                  <v-input-select
                    @value="e => form.tipoRespuesta = e"
                    item-color="primary"
                    required
                    v-model="form.tipoRespuesta"
                    :init="form.tipoRespuesta"
                    label="Tipo de respuesta (*)"
                    color="primary"
                    :items="aTiposRespuestas"
                    :disabled="viewDetail"
                    item-text="label"
                    outlined
                    @change="handleChangeTipoRespuesta"
                    dense
                    item-value="value"
                    :rules="[(val) => !!val || 'No puede estar vacio']"
                  ></v-input-select>
                </v-col>
                <v-col cols="12" class="pb-0">
                  <v-input-select
                    @value="e => form.nivelDificultad = e"
                    item-color="primary"
                    required
                    v-model="form.nivelDificultad"
                    :init="form.nivelDificultad"
                    label="Nivel de dificultad (*)"
                    color="primary"
                    :items="aNivelDificultad"
                    item-text="label"
                    outlined
                    :disabled="viewDetail"
                    dense
                    item-value="value"
                    :rules="[(val) => !!val || 'No puede estar vacio']"
                  ></v-input-select>
                </v-col>
              </v-row>
              <v-row>
                <v-col cols="12" v-if="form.tipoRespuesta">
                  <v-radio-group
                    row
                    @change="handleChangeSelected"
                    :disabled="viewDetail"
                    :rules="[(val) => !!val || 'No puede estar vacio']"
                    v-model="form.preguntaImagen"
                    class="mradio">
                    <v-radio
                      color="primary"
                      label="Subir pregunta"
                      value="PREGUNTA"
                    ></v-radio>
                    <v-radio
                      @click="handleChangeSelected"
                      color="primary"
                      label="Subir imagen"
                      value="IMAGEN"
                    ></v-radio>
                  </v-radio-group>
                </v-col>
                <v-col cols="12" class="pb-0" v-if="form.preguntaImagen === 'PREGUNTA'">
                  <v-input-textarea
                    @value="e => form.textoPregunta = e"
                    item-color="primary"
                    required
                    :rows="10"
                    v-model="form.textoPregunta"
                    :init="form.textoPregunta"
                    :disabled="viewDetail"
                    label="Pregunta (*)"
                    outlined
                    counter
                    dense
                    :rules="[
                      (val) => !!val || 'No puede estar vacio',
                      (val) => (val || '').length <= 1000 || 'La cantidad de caracteres supera lo establecido.'
                    ]"
                  ></v-input-textarea>
                </v-col>
                <v-col cols="12" v-if="imageSelected" class="d-flex flex-row align-center justify-center">
                  <img
                    loading="lazy"
                    :src="imageSelected"
                    alt="imagen seleccionada"
                  />
                </v-col>
                <v-col
                  cols="12" class="pb-0"
                  v-if="form.tipoRespuesta && form.tipoRespuesta !== FALSO_VERDADERO && form.preguntaImagen">
                  <v-col cols="12" class="pa-0">
                    <v-alert
                      type="info"
                      text
                      dense
                      class="fs8"
                      width="100%"
                    >
                      Las <strong>OPCIONES</strong> son el texto que normalmente tiene una pregunta, por ejemplo:<br/>
                      a) Es un texto para la primera opción <br/> b) Segunda opción <br/>
                      Para agregar mas opciones haga click en el icono <strong class="fs12">"+"</strong>
                    </v-alert>
                    <v-alert
                      type="error"
                      text
                      dense
                      class="fs8"
                      width="100%"
                      v-if="aOpciones.length === 0"
                    >
                      Tiene que agregar opciones
                    </v-alert>
                  </v-col>
                  <v-card elevation="0" class="mb-3">
                    <v-row no-gutters>
                      <v-col cols="11" sm="11">
                        Opciones:
                      </v-col>
                      <v-col cols="1" sm="1">
                        <v-tooltip bottom color="success">
                          <template v-slot:activator="{ on, attrs }">
                            <v-btn
                              icon
                              color="success"
                              v-bind="attrs"
                              v-on="on"
                              :disabled="viewDetail"
                              @click="addOption">
                              <v-icon-component icon="add"></v-icon-component>
                            </v-btn>
                          </template>
                          <span>Agregar opción</span>
                        </v-tooltip>
                      </v-col>
                    </v-row>
                  </v-card>
                  <v-card elevation="0">
                    <v-alert
                      type="info"
                      text
                      dense
                      class="fs8"
                      width="100%"
                      v-if="form.preguntaImagen === 'IMAGEN'"
                    >
                      El texto de las opciones se encuentran deshabilitadas por que se encuentran embebidas dentro de la imagen.<br/>
                      Si por alguna razon estos campos tuvieran algun texto no se preocupe se limpiaran cuando se envie toda la información.
                    </v-alert>
                    <template v-for="(opcion, idx) in aOpciones">
                      <v-opciones
                        :key="opcion.key"
                        :letter="opcion.key"
                        :value="opcion.text"
                        @setOption="setOption"
                        :observado="viewDetail"
                        :imagen="form.preguntaImagen"
                        :showDelete="(aOpciones.length - 1) === idx"
                        @deleteOption="deleteOption"
                      />
                    </template>
                  </v-card>
                </v-col>
              </v-row>
              <v-row elevation="0" v-if="form.tipoRespuesta && form.tipoRespuesta === FALSO_VERDADERO">
                <v-col cols="12" class="pb-0">
                  Respuesta (*):
                </v-col>
                <v-col cols="12" class="pb-0">
                  <v-radio-group
                    class="mt-0 pt-0"
                    :disabled="viewDetail"
                    v-model="form.opciones"
                    :rules="[(val) => !!val || 'Tiene que marcar si la pregunta es falso o verdadero']"
                  >
                    <v-radio
                        label="Falso"
                        value="FALSO"
                    ></v-radio>
                    <v-radio
                        label="Verdadero"
                        value="VERDADERO"
                    ></v-radio>
                  </v-radio-group>
                </v-col>
              </v-row>
              <v-row v-if="form.tipoRespuesta && form.tipoRespuesta !== FALSO_VERDADERO && form.preguntaImagen">
                <v-col cols="12">
                  <v-alert
                    type="info"
                    text
                    dense
                    class="fs8"
                    width="100%"
                  >
                    Si el tipo de respuesta es <strong>{{ SELECCION_SIMPLE.replace(/_/g, ' ') }}</strong> entonces en el
                    campo "respuesta" solo seleccione la opción correcta.<br/><br/>
                    Si el tipo es respuesta es <strong>{{ SELECCION_MULTIPLE.replace(/_/g, ' ') }}</strong> entonces en
                    el campo "respuesta" seleccione al menos {{ CANTIDAD_MINIMA_RESPUESTA_SELECCION_MULTIPLE }} respuestas,
                    su selección se mostrara de la siguiente forma. ejemplo: a, b, c
                  </v-alert>
                </v-col>
                <v-col cols="12" class="pb-0">
                  <v-input-select
                    @value="e => form.respuestas = e"
                    :init="form.respuestas"
                    item-color="primary"
                    required
                    :disabled="viewDetail"
                    v-model="form.respuestas"
                    label="Respuesta (*)"
                    outlined
                    :multiple="form.tipoRespuesta === SELECCION_MULTIPLE"
                    :items="aRespuestas"
                    :rules="form.tipoRespuesta === SELECCION_SIMPLE ?
                      [(val) => !!val || 'La respuesta no puede estar vacio'] :
                      [(val) => !!(val || '').length > 0 || 'La respuesta no puede estar vacio']"
                    dense
                  ></v-input-select>
                </v-col>
              </v-row>
              <v-row>
                <v-col
                  cols="12" class="pb-0"
                  v-if="viewDetail || state === ESTADO_OBSERVADO"
                >
                  <v-input-textarea
                    @value="e => form.observacion = e"
                    :init="form.observacion"
                    label="Observaciones a la pregunta"
                    :rows="3"
                    :disabled="$storage.get('rol').rol !== 'COMITE_DOCENTE_VERIFICADOR'"
                    v-model="form.observacion"
                    counter
                    :rules="reviewingToApprove ? [
                      (val) => (val || '').length <= 200 || 'La cantidad de caracteres supera lo establecido.'] : [
                      (val) => !!val || 'No puede estar vacio la observacion',
                      (val) => (val || '').length <= 200 || 'La cantidad de caracteres supera lo establecido.'
                    ]"
                    color="primary"
                    placeholder="Escriba aqui el motivo de la observacion"
                  ></v-input-textarea>
                </v-col>
              </v-row>
            </v-container>
          </v-card>
        </v-form>
      </template>
      <template slot="extraButtons">
        <v-row v-if="viewDetail">
          <v-col cols="12" xs="12" sm="6" md="6" lg="6">
            <v-btn :loading="wait" dark block color="error" outlined @click="state = null; reviewingToApprove = false; observed = true; saveActions()" elevation="0">
              <v-icon-component icon="thumb_down_off_alt" className="mr-2"></v-icon-component>
              Observar pregunta
            </v-btn>
          </v-col>
          <v-col cols="12" xs="12" sm="6" md="6" lg="6">
            <v-btn :loading="wait" dark block color="success" outlined @click="state = 'APROBADO'; observed = false; form.observacion = ''; reviewingToApprove = true; saveActions()" elevation="0">
              <v-icon-component icon="thumb_up" className="mr-2"></v-icon-component>
              Aprobar pregunta
            </v-btn>
          </v-col>
        </v-row>
      </template>
    </app-dialog>
    <crud-table
      v-if="showCrudTable"
      :headers="headers"
      description="Banco de preguntas"
      :url.sync="url"
      :show-filter-options="false"
      :widthModal="500"
      :show-filter-init="true"
      :filters.sync="filters"
      :order="order"
      :custom="true"
      :omitir-carga-on-mounted="true"
    >
      <template slot="buttons">
        <v-tooltip bottom color="primary" v-if="$storage.get('rol').rol === 'COMITE_DOCENTE_CARGA'">
          <template v-slot:activator="{ on }">
            <v-btn
              color="primary"
              id="btnAllApprove"
              v-on="on"
              icon
              @click="handleClickAllApprove"
            >
              <v-icon-component icon="send"/>
            </v-btn>
          </template>
          <span>Se enviaran todas las preguntas al comite de verificacion</span>
        </v-tooltip>
        <!-- Subir Imagenes -->
        <v-tooltip bottom color="primary" v-if="$storage.get('rol').rol === 'COMITE_DOCENTE_CARGA'">
          <template v-slot:activator="{ on }">
            <v-btn
              color="primary"
              :small="['xs', 'sm'].includes($vuetify.breakpoint.name)"
              icon
              id="btnUploadImage"
              v-on="on"
              @click.native.stop="dialogSubirImagenes = true"
              slot="activator"
            >
              <v-icon-component icon="image"/>
            </v-btn>
          </template>
          <span> Subir imágenes </span>
        </v-tooltip>
        <v-tooltip bottom color="primary" v-if="$storage.get('rol').rol === 'COMITE_DOCENTE_CARGA'">
          <template v-slot:activator="{ on }">
            <v-btn
              color="primary"
              :small="['xs', 'sm'].includes($vuetify.breakpoint.name)"
              icon
              id="btnUploadFile"
              v-on="on"
              @click.native.stop="oModal"
              slot="activator"
            >
              <v-icon-component icon="file_upload"/>
            </v-btn>
          </template>
          <span> Subir banco de preguntas </span>
        </v-tooltip>
        <v-tooltip bottom color="primary" v-if="btnNew">
          <template v-slot:activator="{ on }">
            <v-btn
              color="primary"
              :small="['xs', 'sm'].includes($vuetify.breakpoint.name)"
              icon
              id="addQuestion"
              v-on="on"
              @click="handleClickQuestion"
              slot="activator"
            >
              <v-icon-component icon="add"/>
            </v-btn>
          </template>
          <span> Agregar pregunta </span>
        </v-tooltip>
      </template>

      <!-- SLOT PARA TODOS LOS ITEMS (Solo en caso de que se quiera personalizar cada columna o mas de 1 columna) -->
      <template slot="items" slot-scope="items">
        <tr :class="getQuestionStatus(items)">
          <td :class="items.items.estado === ESTADO_OBSERVADO ? 'white--text' : ''">{{ items.items.tipoPregunta }}</td>
          <td :class="items.items.estado === ESTADO_OBSERVADO ? 'white--text' : ''">{{
              items.items.nivelDificultad
            }}
          </td>
          <td class="text--wrap">
            <div :class="items.items.estado === ESTADO_OBSERVADO ? 'white--text' : ''">{{
                items.items.textoPregunta
              }}
            </div>
            <v-show-more v-if="(items.items.textoPregunta || '').trim().length > 0" :text="items.items.textoPregunta"/>
          </td>
          <td>
            <v-show-more
              :URL_LAZY_IMAGES="URL_LAZY_IMAGES"
              className="show-images"
              v-if="items.items.imagenPregunta"
              image
              :filename="items.items.imagenPregunta"
              :maxWidth="500"
              :url="`${URL_SERVER_IMAGES}${items.items.imagenPregunta}`"
            />
          </td>
          <td>
            <v-tooltip bottom :color="getQuestionStatus(items, 'element')">
              <template v-slot:activator="{ on }">
                <v-btn
                  :ripple="false"
                  plain
                  text
                  class="cursor-normal"
                  :color="getQuestionStatus(items, 'element')"
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
            <v-tooltip bottom color="info" v-if="btnWatch && items.items.estado === ESTADO_ENVIADO">
              <template v-slot:activator="{ on }">
                <v-btn
                  icon
                  v-on="on"
                  color="info"
                  @click.stop="state = null; reviewingToApprove = true; viewDetail = true; handleClickQuestion(items)"
                >
                  <v-icon-component icon="visibility"></v-icon-component>
                </v-btn>
              </template>
              <span>Ver detalle</span>
            </v-tooltip>

            <v-tooltip bottom color="primary" v-if="btnSend && items.items.estado === ESTADO_CREADO">
              <template v-slot:activator="{ on }">
                <v-btn
                  icon
                  v-on="on"
                  color="primary"
                  @click.stop="sendQuestion(items)"
                >
                  <v-icon-component icon="send"></v-icon-component>
                </v-btn>
              </template>
              <span>Enviar pregunta al comite verificador</span>
            </v-tooltip>

            <v-tooltip
              bottom color="success"
              v-if="btnEdit && [ESTADO_CREADO, ESTADO_OBSERVADO].includes(items.items.estado)"
            >
              <template v-slot:activator="{ on }">
                <v-btn
                    icon
                    v-on="on"
                    color="success"
                    @click.stop="
                    observed = null;
                    state = items.items.estado;
                    handleClickQuestion(items)
                  "
                >
                  <v-icon-component icon="edit"></v-icon-component>
                </v-btn>
              </template>
              <span> {{ items.items.estado === ESTADO_OBSERVADO ? 'Solucionar observación' : 'Editar pregunta' }}</span>
            </v-tooltip>
            <v-tooltip bottom color="error" v-if="btnDelete && items.items.estado === ESTADO_CREADO">
              <template v-slot:activator="{ on }">
                <v-btn
                    icon
                    v-on="on"
                    color="error"
                    @click.prevent="deleteItem(items)"
                >
                  <v-icon-component icon="delete"></v-icon-component>
                </v-btn>
              </template>
              <span>Eliminar pregunta</span>
            </v-tooltip>
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
      No existen registros, porque no existen áreas asignadas a esta etapa.
    </v-alert>
    <v-card elevation="0" class="progress--status" v-if="uploading">
      <v-card elevation="0" class="cards fs8" :class="$vuetify.theme.dark ? 'black--text' : 'white--text'">
        <v-icon-component icon="local_shipping" :size="45"></v-icon-component>
        <v-icon-component icon="done" :size="25"></v-icon-component>
        Se subio exitosamente el archivo
      </v-card>
      <v-card elevation="0" class="cards fs8 info--text">
        <v-progress-circular indeterminate class="mr-3" color="info"/>
        Se esta procesando el archivo pero puede ver el estado haciendo click
        <v-btn depressed text style="text-transform: none; letter-spacing: 0" min-width="40" @click="getStatus"
               class="primary--text pl-0 pr-0">aqui
        </v-btn>
      </v-card>
    </v-card>
    <!-- MODAL PARA CARGAR MASIVAMENTE PREGUNTAS -->
    <v-dialog v-model="$store.state.modal2" width="450" persistent>
      <v-file-upload
        ref="fileUpload"
        @close="closeUploadFileModal"
        key="fileUpload"
        :id-eag="idAreaSeleccionada"
        :uploading.sync="uploading"/>
    </v-dialog>
    <!-- MODAL PARA BUSCAR IMAGENES -->
    <app-dialog
      :dialog.sync="$store.state.modal4"
      titulo="Buscador de imagenes"
      @open-dialog="form.initImagenPregunta = null"
      @close-dialog="$store.commit('closeModal', 4); aImages = []; form.imagenPregunta = null; form.initImagenPregunta = null"
      :mostrarAcciones="false"
    >
      <v-card class="pa-3" elevation="0" :key="reference">
        <v-row>
          <v-col cols="12">
            <v-input-text-field
              label="Imagen:"
              @value="e => form.imagenPregunta = e"
              :init="form.initImagenPregunta"
              v-model="form.imagenPregunta"
              :append-icon="ICONS.search"
              v-on:append="searchImages"
              placeholder="Escriba algo para empezar a buscar imagenes"
              @focus="addListener"
              autofocus
              id="searchImage"
              dense
            />
            <v-alert
              v-if="aImages.length > 0"
              type="info"
              text
              dense
              class="fs8 mb-0"
            >
            Para seleccionar una imagen solo tiene que hacer click en una de ellas
            </v-alert>
          </v-col>
          <v-col cols="12" class="ma-0 pa-0 pb-3">
            <v-card v-if="isTyping" elevation="0" class="d-flex flex-column align-center justify-center">
              <v-progress-circular
                indeterminate
                color="red"
              ></v-progress-circular>
              Buscando imagenes...
            </v-card>
            <v-card elevation="0" class="d-flex flex-row align-center justify-space-around flex-wrap" v-if="aImages.length > 0">
              <v-img
                v-for="item in aImages"
                :key="item.source"
                @click="handleSelectImage(item)"
                class="ma-2 cursor--pointer"
                :lazy-src="URL_LAZY_IMAGES"
                max-height="150"
                max-width="220"
                contain
                :src="`${URL_SERVER_IMAGES}${item.source}`"
              ></v-img>
            </v-card>
            <v-card v-else elevation="0" class="text-center">
              <span v-if="!isTyping">No hay imagenes que mostrar</span>
            </v-card>
          </v-col>
        </v-row>
      </v-card>
    </app-dialog>
    <!-- MODAL PARA SUBIR IMAGENES -->
    <v-dialog
      v-model="dialogSubirImagenes"
      persistent
      max-width="600px"
    >
      <v-card>
        <v-card-title>
          <h3>Imágenes</h3>
        </v-card-title>
        <v-card-text>
          <v-container>
            <subir-imagenes/>
          </v-container>
        </v-card-text>
        <v-card-actions>
          <v-spacer></v-spacer>
          <v-btn
            color="blue darken-1"
            text
            @click="dialogSubirImagenes = false"
          >
            Cerrar
          </v-btn>
        </v-card-actions>
      </v-card>
    </v-dialog>
  </v-card>
</template>
<script>
import CrudTable from '@/plugins/crud-table/CrudTable.vue';
import actions from '@/plugins/crud-table/mixins/crud-table';
import vIconComponent from '@/plugins/icon/index.vue';
import vFileUpload from '@/plugins/fileUpload/index.vue';
import AppDialog from '@/plugins/modal/AppDialog.vue';
import subirImagenes from '@/plugins/subirImagenes/index.vue';
import vOpciones from './opciones.vue';

const SELECCION_SIMPLE = 'SELECCION_SIMPLE';
const SELECCION_MULTIPLE = 'SELECCION_MULTIPLE';
const FALSO_VERDADERO = 'FALSO_VERDADERO';
const IMAGEN = 'IMAGEN';
const URL_QUERY_IMAGES = 'preguntas/imagenes?ruta=&recursivo=1&contiene=';
const URL_LAZY_IMAGES = `${process.env.VUE_APP_FRONTEND}/img/loader.gif`;
const URL_SERVER_IMAGES = process.env.VUE_APP_SERVER_MEDIA;

const ESTADO_CREADO = 'CREADO';
const ESTADO_ENVIADO = 'ENVIADO';
const ESTADO_OBSERVADO = 'OBSERVADO';
const ESTADO_APROBADO = 'APROBADO';

const CANTIDAD_MINIMA_OPCIONES_SELECCION_SIMPLE = 3; // ECU - v1.0.8
const CANTIDAD_MINIMA_OPCIONES_SELECCION_MULTIPLE = 3; // ECU - v1.0.8

const CANTIDAD_MINIMA_RESPUESTA_SELECCION_MULTIPLE = 2; // ECU - v1.0.8
const CANTIDAD_MINIMA_RESPUESTA_SELECCION_SIMPLE = 1; // ECU - v1.0.8
export default {
  mixins: [actions],
  data: () => ({
    name: '',
    url: null,
    actualizarRegistro: null,
    form: {},
    valid: null,
    btnEdit: null,
    btnSend: null,
    parametros: null,
    wait: false,
    reviewingToApprove: null,
    btnDelete: null,
    btnNew: null,
    btnWatch: null,
    observed: null,
    isTyping: null,
    viewDetail: null,
    modalPreguntas: null,
    uploading: null,
    SELECCION_SIMPLE: SELECCION_SIMPLE,
    SELECCION_MULTIPLE: SELECCION_MULTIPLE,
    FALSO_VERDADERO: FALSO_VERDADERO,
    ESTADO_CREADO: ESTADO_CREADO,
    ESTADO_ENVIADO: ESTADO_ENVIADO,
    ESTADO_OBSERVADO: ESTADO_OBSERVADO,
    ESTADO_APROBADO: ESTADO_APROBADO,
    URL_QUERY_IMAGES: URL_QUERY_IMAGES,
    URL_SERVER_IMAGES: URL_SERVER_IMAGES,
    URL_LAZY_IMAGES: URL_LAZY_IMAGES,
    IMAGEN: IMAGEN,
    state: null,
    CANTIDAD_MINIMA_OPCIONES_SELECCION_SIMPLE: CANTIDAD_MINIMA_OPCIONES_SELECCION_SIMPLE,
    CANTIDAD_MINIMA_OPCIONES_SELECCION_MULTIPLE: CANTIDAD_MINIMA_OPCIONES_SELECCION_MULTIPLE,
    CANTIDAD_MINIMA_RESPUESTA_SELECCION_MULTIPLE: CANTIDAD_MINIMA_RESPUESTA_SELECCION_MULTIPLE,
    CANTIDAD_MINIMA_RESPUESTA_SELECCION_SIMPLE: CANTIDAD_MINIMA_RESPUESTA_SELECCION_SIMPLE,
    aTiposPreguntas: [],
    aTiposRespuestas: [],
    aNivelDificultad: [],
    aEtapas: [],
    etapas: [],
    idStage: null,
    aAreas: [],
    idArea: null,
    idAreaSeleccionada: null,
    estadoSeleccionado: null,
    nivelSeleccionado: null,
    tipoPreguntaSeleccionado: null,
    tipoRespuestaSeleccionado: null,
    abecedario: [],
    aOpciones: [],
    aRespuestas: [],
    order: ['createdAt', 'DESC'],
    filters: [],
    showCrudTable: false,
    reference: null,
    headers: [
      {
        text: 'Tipo de pregunta',
        align: 'center',
        sortable: true,
        value: 'tipoPregunta',
      },
      {
        text: 'Nivel',
        align: 'center',
        sortable: true,
        value: 'nivelDificultad',
      },
      {
        text: 'Pregunta',
        align: 'center',
        sortable: false,
        value: 'textoPregunta',
      },
      {
        text: 'Imagen',
        align: 'center',
        sortable: false,
        value: 'imagenPregunta',
      },
      {
        text: 'Estado',
        sortable: true,
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
    dialogSubirImagenes: false,
    aImages: [],
    imageSelected: null
  }),
  methods: {
    handleSelectImage(image) {
      this.$store.commit('closeModal', 4);
      this.form = {
        ...this.form,
        imagenPregunta: image.nombre,
        initImagenPregunta: null
      };
      this.aImages = [];
      this.imageSelected = `${this.URL_SERVER_IMAGES}${image.source}`;
    },
    async searchImages () {
      this.aImages = [];
      // let images = await fetch(`${this.URL_QUERY_IMAGES}matematicas&contiene=${this.form.imagenPregunta}`);
      // images = await images.json();
      const images = await this.$service.get(`${this.URL_QUERY_IMAGES}${this.form.imagenPregunta}`);
      this.isTyping = false;
      this.aImages = images.datos.filas.map(image => {
        const obj = {
          nombre: image.nombre,
          source: image.nombre
        };
        return obj;
      });
    },
    addListener () {
      const input = document.querySelector('#searchImage');
      let typing;
      const timer = 1000;
      input.onkeydown = () => {
        this.isTyping = true;
        this.aImages = [];
        clearTimeout(typing);
        typing = setTimeout(async () => {
          await this.searchImages();
        }, timer);
      };
    },
    handleClickAllApprove() {
      if (this.$store.state.totalCurrentCrudTable === 0) {
        this.$message.error('Usted no tiene preguntas cargadas, favor cargar las preguntas correspondientes');
        return;
      }
      this.$confirm('¿Esta seguro de aprobar todas las preguntas?', async () => {
        try {
          const { id } = this.$storage.get('areaSeleccionada');
          const response = await this.$service.patch(`etapasAreaGrado/${id}/preguntas/envioLotes`);
          if (response && response.isOK) {
            if (response.datos?.affected === 0) {
              this.$message.error('No hay preguntas para enviar y aprobar');
            } else {
              this.$message.success(`Se envió: ${response.datos.affected} pregunta(s)`);
            }
            this.updateList();
          } else {
            throw new Error(response.mensaje);
          }
        } catch (error) {
          this.$message.error(error.message);
        }
      }, () => {
      }, 'aprobar todos', 'cancelar');
    },
    getQuestionStatus({ items: { estado } }, dom = 'row') {
      let className;
      if (estado === this.ESTADO_OBSERVADO && dom) {
        className = 'pregunta--observada';
      }
      if (estado === this.ESTADO_CREADO && dom === 'element') {
        className = 'info';
      }
      if (estado === this.ESTADO_OBSERVADO && dom === 'element') {
        className = 'white';
      }
      return className;
    },
    handleChangeTipoRespuesta() {
      this.form = {
        ...this.form,
        respuestas: this.form.tipoRespuesta === this.SELECCION_MULTIPLE ? [] : null
      };
      this.aRespuestas = Object.keys(this.aOpciones).map(item => this.abecedario[item]);
    },
    async selectStage() {
      const areas = await this.$service.get(`etapas-areas-grados?idEtapa=${this.idStage}`);
      this.aAreas = areas.datos.filas;
    },
    handleChangeSelected() {
      this.aOpciones = [{
        key: 'a',
        text: null
      },
      {
        key: 'b',
        text: null
      },
      {
        key: 'c',
        text: null
      }];
      if (this.form.preguntaImagen === this.IMAGEN) {
        this.form = {
          ...this.form,
          textoPregunta: null,
          initImagenPregunta: null,
          respuestas: this.form.tipoRespuesta === this.SELECCION_MULTIPLE ? [] : null
        };
        this.aRespuestas = Object.keys(this.aOpciones).map(item => this.abecedario[item]);
        this.imageSelected = null;
        this.reference = Math.random();
        this.$store.commit('openModal', 4);
      } else {
        this.imageSelected = null;
        this.form = {
          ...this.form,
          imagenPregunta: null,
          initImagenPregunta: null
        };
      }
      this.aRespuestas = Object.keys(this.aOpciones).map(item => this.abecedario[item]);
    },
    getStatus() {
      this.$store.commit('openModal', 2);
      this.uploading = !this.uploading;
      setTimeout(() => {
        this.updateList();
        this.$refs.fileUpload.getFileStatus();
      }, 100);
    },
    async closeUploadFileModal(option) {
      this.$store.commit('closeModal', 2);
      this.$waiting(false);
      if (option) {
        this.uploading = !this.uploading;
      }
    },
    remove() {
      this.form.imagenPregunta = null;
    },
    deleteOption(letter) {
      const index = this.aOpciones.findIndex(option => option.key === letter);
      this.aOpciones.splice(index, 1);
      this.aRespuestas = Object.keys(this.aOpciones)
        .map(item => this.abecedario[item]);
      this.form.respuestas = this.form.tipoRespuesta === this.SELECCION_MULTIPLE ? [] : null;
    },
    sendQuestion({ items: { id } }) {
      this.$confirm('¿Esta seguro de enviar la pregunta al comite verificador?', async () => {
        try {
          const response = await this.$service.patch(`preguntas/${id}/estados`, {
            operacion: 'ENVIAR'
          });
          if (response && response.isOK) {
            this.$message.success(response.mensaje || 'La pregunta se envio exitosamente al comite de verificacion');
            this.updateList();
          } else {
            throw new Error(response.mensaje);
          }
        } catch (error) {
          this.$message.error(error.message);
        }
      });
    },
    setOption({
      key,
      text
    }) {
      this.aOpciones.filter(option => {
        if (option.key === key) {
          option.text = text;
        }
      });
    },
    addOption() {
      if (Array.isArray(this.aOpciones) && this.aOpciones.length < 10) {
        const options = this.aOpciones.map((option, idx) => {
          const obj = {};
          obj.key = this.abecedario[idx];
          obj.text = option.text;
          return obj;
        });
        this.aOpciones = options;
        this.aOpciones.push({
          key: this.abecedario[this.aOpciones.length],
          text: ''
        });
        this.aRespuestas = Object.keys(this.aOpciones).map(item => this.abecedario[item]);
      } else {
        this.$message.error('No se puede agregar mas opciones');
      }
    },
    oModal() {
      this.$store.commit('openModal', 2);
    },
    reset() {
      this.form = {};
      this.imageSelected = null;
      this.aOpciones = [];
    },
    handleClickQuestion({ items }) {
      this.reset();
      if (items && items.id) {
        this.form = { ...items };
        this.form = {
          ...this.form,
          observacion: (this.form.observacion || '').trim().length === 0 ? null : this.form.observacion
        };
        if (items.tipoRespuesta === this.FALSO_VERDADERO) {
          this.form = {
            ...this.form,
            opciones: items.respuestas.includes('FALSO') ? 'FALSO' : 'VERDADERO',
            preguntaImagen: (items.textoPregunta || '').length === 0 ? 'IMAGEN' : 'PREGUNTA'
          };
        } else {
          this.aOpciones = items.opciones ? Object.keys(items.opciones)
            .map(item => {
              const obj = {};
              obj.key = item;
              obj.text = items.opciones[item];
              return obj;
            }) : null;

          this.aRespuestas = Object.keys(items.opciones);
          this.form = {
            ...this.form,
            preguntaImagen: (items.textoPregunta || '').length === 0 ? 'IMAGEN' : 'PREGUNTA',
            respuestas: items.tipoRespuesta === this.SELECCION_SIMPLE ? items.respuestas[0] : items.respuestas
          };
        }
        if (this.form.preguntaImagen === this.IMAGEN) {
          this.imageSelected = `${this.URL_SERVER_IMAGES}${this.form.imagenPregunta}`;
        }
      } else {
        this.viewDetail = null;
        this.state = null;
        this.aOpciones = [];
        this.aRespuestas = Object.keys(this.aOpciones)
          .map(item => this.abecedario[item]);
      }
      this.modalPreguntas = true;
    },
    deleteItem({ items: { id } }) {
      this.$confirm('¿Está seguro de eliminar la pregunta?', async () => {
        const response = await this.$service.delete(`preguntas/${id}`);
        if (!response) {
          this.$message.success('Pregunta eliminada correctamente');
          this.updateList();
        } else {
          this.$message.error(response.mensaje);
        }
      });
    },
    closeModal() {
      this.$store.commit('closeModal', 3);
    },
    saveActions () {
      this.wait = true;
      setTimeout(async () => {
        await this.save();
      }, 100);
    },
    /**
     * @function save
     * @description Esta funcion esta creada para guardar en la BD
     * @author dbarra@agetic.gob.bo
     */
    async save() {
      try {
        let errors = new Set();
        this.$refs.form.inputs.forEach(e => {
          if (e.errorBucket && e.errorBucket.length) {
            errors.add(...e.errorBucket);
          }
        });
        errors = [...errors];
        if (this.$refs.form.validate()) {
          this.wait = true;
          this.url = this.obtenerRuta();
          const opciones = this.aOpciones.reduce((container, item) => {
            container[item.key] = item.text;
            return container;
          }, {});
          let respuestas;
          if (this.form.tipoRespuesta === this.FALSO_VERDADERO) {
            respuestas = [this.form.opciones];
          } else {
            respuestas = (Array.isArray(this.form.respuestas)) ? this.form.respuestas : this.form.respuestas.split(',');
            respuestas = respuestas.map(item => item.trim());
          }
          const data = {
            ...this.form,
            opciones,
            respuestas
          };
          if (data.tipoRespuesta === this.SELECCION_SIMPLE && Object.keys(opciones).length < this.CANTIDAD_MINIMA_OPCIONES_SELECCION_SIMPLE) {
            this.$message.error(`La cantidad mínima de opciones para una <strong>${data.tipoRespuesta.replace(/_/g, ' ')}</strong> es de <strong>${this.CANTIDAD_MINIMA_OPCIONES_SELECCION_SIMPLE}</strong>`);
            this.wait = false;
            return;
          }
          if (data.tipoRespuesta === this.SELECCION_MULTIPLE && Object.keys(opciones).length < this.CANTIDAD_MINIMA_OPCIONES_SELECCION_MULTIPLE) {
            this.$message.error(`La cantidad mínima de opciones para una <strong>${data.tipoRespuesta.replace(/_/g, ' ')}</strong> es de <strong>${this.CANTIDAD_MINIMA_OPCIONES_SELECCION_MULTIPLE}</strong>`);
            this.wait = false;
            return;
          }
          if (data.tipoRespuesta === this.SELECCION_MULTIPLE) {
            if (!(this.form.respuestas.length >= this.CANTIDAD_MINIMA_RESPUESTA_SELECCION_MULTIPLE)) {
              this.$message.error(`La cantidad mínima de respuestas para una <strong>${data.tipoRespuesta.replace(/_/g, ' ')}</strong> es de <strong>${this.CANTIDAD_MINIMA_RESPUESTA_SELECCION_MULTIPLE}</strong>`);
              this.wait = false;
              return;
            }
          }
          if (data.tipoRespuesta === this.SELECCION_SIMPLE) {
            if (!(this.form.respuestas.length >= this.CANTIDAD_MINIMA_RESPUESTA_SELECCION_SIMPLE)) {
              this.$message.error(`La cantidad mínima de respuestas para una <strong>${data.tipoRespuesta.replace(/_/g, ' ')}</strong> es de <strong>${this.CANTIDAD_MINIMA_RESPUESTA_SELECCION_SIMPLE}</strong>`);
              this.wait = false;
              return;
            }
          }
          if (this.form.tipoRespuesta === this.FALSO_VERDADERO) delete data.opciones;
          if (data.id) {
            if ((this.form.textoPregunta || '').trim().length > 0) {
              data.imagenPregunta = null;
            } else {
              data.textoPregunta = null;
              if (data.opciones) {
                data.opciones = Object.keys(data.opciones)
                  .reduce((container, item) => {
                    container = {
                      ...container,
                      [item]: null
                    };
                    return container;
                  }, {});
              }
            }
            let response;
            if (this.observed) {
              response = await this.$service.patch(`preguntas/${data.id}/estados`, {
                operacion: 'OBSERVAR',
                observacion: this.form.observacion
              });
            } else {
              if (!this.reviewingToApprove) {
                response = await this.$service.put(`preguntas/${data.id}`, data);
              } else {
                response = {
                  isOK: true,
                  mensaje: 'Se aprobo la pregunta correctamente'
                };
              }
              if (this.state === this.ESTADO_OBSERVADO) {
                await this.$service.patch(`preguntas/${data.id}/estados`, {
                  operacion: 'ENVIAR'
                });
              }
              if (this.state === this.ESTADO_APROBADO) {
                await this.$service.patch(`preguntas/${data.id}/estados`, {
                  operacion: 'APROBAR'
                });
              }
            }
            if (response && response.isOK) {
              this.observed = null;
              this.reviewingToApprove = null;
              this.modalPreguntas = false;
              this.reset();
              this.closeModal();
              this.updateList();
              this.$message.success(response.mensaje || 'Los datos se actualizaron de forma correcta');
            } else {
              throw new Error(response.mensaje);
            }
          } else {
            delete data.id;
            const response = await this.$service.post(this.url, data);
            if (response && response.isOK) {
              this.reset();
              this.closeModal();
              this.updateList();
              this.$message.success(response.mensaje || 'Los datos se guardaron de forma correcta');
              this.modalPreguntas = false;
            } else {
              throw new Error(response.mensaje);
            }
          }
          this.viewDetail = false;
          this.wait = false;
        } else {
          this.wait = false;
          this.$message.error(`Error: Complete los campos obligatorios.<br/> Errores encontrados: <br/> ${errors.join('<br/>')}`);
        }
      } catch (error) {
        this.wait = false;
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
    },

    async actualizarEtapa(idEtapaSeleccionadaNueva) {
      this.etapaSeleccionada = this.etapas.find(item => item.id === idEtapaSeleccionadaNueva);
      this.idEtapaSeleccionada = idEtapaSeleccionadaNueva;
      this.$storage.set('etapaSeleccionada', this.etapaSeleccionada);
      this.$storage.set('areaSeleccionada', null);

      this.areaSeleccionada = null;
      this.idAreaSeleccionada = null;

      await this.cargarAreas();

      this.filters = this.definirFiltros();
      this.url = this.obtenerRuta();

      setTimeout(() => {
        this.updateList();
      }, 100);
    },

    async actualizarEstado(estadoNuevo) {
      this.estadoSeleccionado = estadoNuevo;
      this.filters = this.definirFiltros();
    },

    async actualizarNivel(nivelNuevo) {
      this.nivelSeleccionado = nivelNuevo;
      this.filters = this.definirFiltros();
    },

    async actualizarTipoPregunta(preguntaNueva) {
      this.tipoPreguntaSeleccionado = preguntaNueva;
      this.filters = this.definirFiltros();
    },

    async actualizarTipoRespuesta(respuestaNueva) {
      this.tipoRespuestaSeleccionado = respuestaNueva;
      this.filters = this.definirFiltros();
    },

    actualizarArea(idAreaSeleccionadaNueva) {
      this.areaSeleccionada = this.areas.find(item => item.id === idAreaSeleccionadaNueva);
      this.idAreaSeleccionada = idAreaSeleccionadaNueva;
      this.$storage.set('areaSeleccionada', this.areaSeleccionada);
      this.url = this.obtenerRuta();
    },

    obtenerRuta() {
      return `etapasAreaGrado/${this.idAreaSeleccionada}/preguntas`;
    },

    async cargarEtapas() {
      try {
        if (this.idOlimpiadaSeleccionada) {
          const resultado = await this.$service.get(`olimpiadas/${this.idOlimpiadaSeleccionada}/etapas`);
          if (resultado && resultado.isOK) {
            this.etapas = resultado && resultado.datos && resultado.datos.filas ? resultado.datos.filas : [];
          }
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
          throw new Error('No hay etapas seleccionadas');
        }
      } catch (error) {
        this.areas = [];
      }
    },

    async loadParams() {
      try {
        const olimpiadas = await this.$service.get('olimpiadas?limite=50&pagina=1');
        if (olimpiadas) {
          this.olimpiadas = olimpiadas && olimpiadas.datos && olimpiadas.datos.filas ? olimpiadas.datos.filas : [];
          if (this.olimpiadas.length > 0) {
            this.idOlimpiadaSeleccionada = this.olimpiadas.length > 0 ? this.olimpiadas[0].id : null;
            this.olimpiadaSeleccionada = this.olimpiadas.length > 0 ? this.olimpiadas[0] : null;
            this.$storage.set('olimpiadaSeleccionada', this.olimpiadas.length > 0 ? this.olimpiadas[0] : null);
          } else {
            this.$storage.set('olimpiadaSeleccionada', null);
            this.$storage.set('etapaSeleccionada', null);
            this.$storage.set('areaSeleccionada', null);
            this.idEtapaSeleccionada = null;
            this.idAreaSeleccionada = null;
          }
        }
        await this.cargarEtapas();
        await this.cargarAreas();
        const resultado = await this.$service.get('grados-escolares');
        if (resultado) {
          this.gradosEscolares = resultado && resultado.datos && resultado.datos.filas ? resultado.datos.filas : [];
        }

        this.filters = this.definirFiltros();
        this.showCrudTable = true;
        if (!this.idAreaSeleccionada) {
          this.$message.info('Debe seleccionar una olimpiada, etapa y el area');
        }
        setTimeout(() => {
          this.updateList();
        }, 100);
      } catch (error) {
        this.$message.error(error.message);
      }
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
          nowrap: true,
          label: 'Etapas',
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
          field: 'tipoPregunta',
          type: 'array',
          multiple: false,
          clear: true,
          init: this.tipoPreguntaSeleccionado,
          eventName: 'cambioTipoPregunta',
          onChange: this.actualizarTipoPregunta,
          label: 'Tipo de pregunta',
          values: [
            'OLIMPIADA',
            'CURRICULA'
          ]
        },
        {
          field: 'nivelDificultad',
          type: 'array',
          clear: true,
          multiple: false,
          init: this.nivelSeleccionado,
          eventName: 'cambioNiveles',
          onChange: this.actualizarNivel,
          label: 'Nivel de dificultad',
          values: [
            'COMPLEJA',
            'INTERMEDIA',
            'BASICA'
          ]
        },
        {
          field: 'tipoRespuesta',
          type: 'array',
          clear: true,
          multiple: false,
          init: this.tipoRespuestaSeleccionado,
          eventName: 'cambioTipoRespuestas',
          onChange: this.actualizarTipoRespuesta,
          label: 'Tipo de respuesta',
          values: [
            'SELECCION_MULTIPLE',
            'SELECCION_SIMPLE',
            'FALSO_VERDADERO'
          ]
        },
        {
          field: 'estado',
          type: 'array',
          clear: true,
          multiple: false,
          init: this.estadoSeleccionado,
          eventName: 'cambioEstados',
          onChange: this.actualizarEstado,
          label: 'Estado',
          values: [
            'CREADO',
            'OBSERVADO',
            'ENVIADO',
            'APROBADO'
          ]
        },
        {
          field: 'nombreImagen',
          type: 'text',
          clear: true,
          label: 'Nombre de imagen',
        }
      ];
    },
  },
  mounted() {
    this.$nextTick(async () => {
      const { rol } = this.$storage.get('rol');
      this.btnEdit = await this.$Casbin.enforcer.enforce(rol, '/banco-preguntas', 'update');
      this.btnDelete = await this.$Casbin.enforcer.enforce(rol, '/banco-preguntas', 'delete');
      this.btnNew = rol === 'COMITE_DOCENTE_CARGA';
      this.btnWatch = rol === 'COMITE_DOCENTE_VERIFICADOR';
      this.btnSend = rol === 'COMITE_DOCENTE_CARGA';

      this.abecedario = ['a', 'b', 'c', 'd', 'e', 'f', 'g', 'h', 'i', 'j'];
      const aTiposPreguntas = await this.$service.get('preguntas/tipoPreguntas');
      this.aTiposPreguntas = aTiposPreguntas.datos.map((pregunta) => {
        const obj = {};
        obj.label = pregunta.replace(/_/gi, ' ');
        obj.value = pregunta;
        return obj;
      });
      const aTiposRespuestas = await this.$service.get('preguntas/tipoRespuestas');
      this.aTiposRespuestas = aTiposRespuestas.datos.map((pregunta) => {
        const obj = {};
        obj.label = pregunta.replace(/_/gi, ' ');
        obj.value = pregunta;
        return obj;
      });
      const aNivelesDificultad = await this.$service.get(
        'preguntas/nivelesDificultad'
      );
      this.aNivelDificultad = aNivelesDificultad.datos.map((data) => {
        const obj = {};
        obj.label = data.replace(/_/gi, ' ');
        obj.value = data;
        return obj;
      });

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

      await this.loadParams();
      this.url = this.obtenerRuta();
    });
  },
  components: {
    subirImagenes,
    CrudTable,
    vIconComponent,
    vFileUpload,
    AppDialog,
    vOpciones
  },
};
</script>
<style lang="scss">
@import '../../scss/variables.scss';

.mradio {
  .v-input--radio-group__input {
    display: flex;
    flex-direction: row;
    align-items: center;
    justify-content: center;
  }
}

.pregunta--observada {
  background: #e57373;

  &:hover {
    background: #e57373 !important;
  }
}

.progress--status {
  position: fixed;
  bottom: 0;
  height: 70px;
  left: 0;
  right: 0;
  z-index: 9;
  display: flex;
  flex-direction: row;
  align-items: stretch;
  justify-content: center;

  .cards {
    width: 50%;
    display: flex;
    flex-direction: row;
    align-items: center;
    justify-content: center;
    border: 1px solid $info;
    padding: 15px;

    &:first-child {
      border-right: none;
      background: $info !important;

      &::after {
        position: absolute;
        z-index: 2;
        content: '';
        top: 50%;
        right: 0;
        border: medium none;
        background-color: $info !important;
        width: 1.14285714em;
        height: 1.14285714em;
        border-style: solid;
        border-color: $info;
        border-width: 0 1px 1px 0;
        -webkit-transition: background-color .1s ease, opacity .1s ease, color .1s ease, -webkit-box-shadow .1s ease;
        transition: background-color .1s ease, opacity .1s ease, color .1s ease, -webkit-box-shadow .1s ease;
        transition: background-color .1s ease, opacity .1s ease, color .1s ease, box-shadow .1s ease;
        transition: background-color .1s ease, opacity .1s ease, color .1s ease, box-shadow .1s ease, -webkit-box-shadow .1s ease;
        -webkit-transform: translateY(-50%) translateX(50%) rotate(-45deg);
        transform: translateY(-50%) translateX(50%) rotate(-45deg);
      }
    }
  }
}
</style>
