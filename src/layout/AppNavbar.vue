<template>
  <div>
    <v-app-bar
      :clipped-left="clipped"
      fixed
      flat
      color="backgroundColor"
      height="60"
      class="pa-0 ma-0 navbar"
    >
      <v-btn
        v-if="auth"
        icon
        color="primary"
        @click="setDrawer"
      >
        <v-icon-component icon="menu"/>
      </v-btn>
      <span class="primary--text fs10 font-weight-bold" :class="{isMobile: $vuetify.breakpoint.name === 'xs'}" v-if="!['/login'].includes($route.path)">Sistema de competencias educativas</span>

      <v-spacer></v-spacer>
      <v-card elevation="0">
        <v-btn id="btnHelp" :small="['xs', 'sm'].includes($vuetify.breakpoint.name)" icon text @click="$store.commit('openModal', 6)">
          <v-icon-component icon="help_outline" class="primary--text" color="primary"/>
        </v-btn>
        <v-btn id="btnTheme" :small="['xs', 'sm'].includes($vuetify.breakpoint.name)" icon text
          @click="setTheme">
          <v-icon-component :icon="$vuetify.theme.dark ? 'dark_mode' : 'light_mode'" class="primary--text" color="primary"/>
        </v-btn>
        <v-btn v-if="auth && !['/login'].includes($route.path)" id="btnSettings" :small="['xs', 'sm'].includes($vuetify.breakpoint.name)" text depressed icon
          class="primary--text" @click="settings">
          <v-icon-component icon="settings" color="primary"/>
        </v-btn>
      </v-card>
           <!-- SECCION DE DOCUMENTOS - MANUALES (PDF) -->
          <v-dialog
            v-model="$store.state.modal6"
            content-class="settings"
            :width="['xs', 'sm'].includes($vuetify.breakpoint.name) ? 300 : 200"
            :overlay-opacity="['xs', 'sm'].includes($vuetify.breakpoint.name) ? .7 : 0"
          >
          <v-card elevation="0">
              <v-card-title class="ma-0 pa-1">
                <v-container fluid>
                  <v-row no-gutters class="justify-space-between">
                    <div :cols="11" class="d-flex flex-row align-center text-sm color1--tex primary--text">
                      <v-icon-component class="m-2" icon="picture_as_pdf"></v-icon-component>
                      <span class="fs10 pl-2 font-weight-bold">Manuales</span>
                    </div>
                    <div>
                      <v-icon-tooltip
                        color="primary"
                        icon="close"
                        text="Cerrar ventana emergente"
                        @accion="$store.commit('closeModal', 6)"
                      />
                    </div>
                  </v-row>
                </v-container>
              </v-card-title>
              <v-card-text>
                <ul class="listadoManuales">
                  <li><a :href="baseDescargaManuales + 'AutenticacionYRegistro.pdf'" target="_blank">Autenticación y registro</a></li>
                  <li><a :href="baseDescargaManuales + 'ActivacionDeUsuarios.pdf'" target="_blank">Activación de usuarios</a></li>
                  <li><a :href="baseDescargaManuales + 'Reportes.pdf'" target="_blank">Reportes</a></li>
                  <li><a :href="baseDescargaManuales + 'Estudiantes.pdf'" target="_blank">Estudiantes</a></li>
                  <li><a :href="baseDescargaManuales + 'HabilitacionDeUsuarios.pdf'" target="_blank">Habilitación de usuarios</a></li>
                  <li><a :href="baseDescargaManuales + 'CronogramaEstudiantil.pdf'" target="_blank">Cronograma estudiantil</a></li>
                  <li><a :href="baseDescargaManuales + 'UnidadesEducativasHabilitadas.pdf'" target="_blank">Unidades Educativas habilitadas</a></li>
                </ul>
              </v-card-text>
          </v-card>
          </v-dialog>
          <!-- SECCION DE SETTINGS -->
          <v-dialog
            v-model="modalSettings"
            content-class="settings"
            :width="['xs', 'sm'].includes($vuetify.breakpoint.name) ? 300 : 200"
            :overlay-opacity="['xs', 'sm'].includes($vuetify.breakpoint.name) ? .7 : 0"
          >
            <v-card elevation="0">
              <template v-for="(item, i) in aSettings">
                <!-- SI TIENE SUBMENU -->
                <template v-if="item.submenu">
                  <v-list-group
                    :key="i"
                    :value="true"
                    color="primary"
                    class="item--group--settings"
                    disabled
                    :prepend-icon="ICONS[item.icono]"
                    link
                  >
                    <template v-slot:activator>
                      <v-list-item-content>
                        <v-list-item-title class="fontColor--text ml-0 fs9">{{ item.label }}</v-list-item-title>
                      </v-list-item-content>
                    </template>

                    <section style="margin-left: 60px">
                      <v-radio-group
                        v-model="radioGroup"
                      >
                        <v-radio
                          color="success"
                          v-for="subItem in item.submenu"
                          @click="setRol(subItem)"
                          :key="subItem.label"
                          class="font-weight-regular pb-5"
                          :label="$util.toCapitalize(subItem.nombre)"
                          :value="subItem.idRol"
                        ></v-radio>
                      </v-radio-group>
                    </section>

                  </v-list-group>
                </template>
                <!-- SI NO TIENE SUBMENU -->
                <template v-else>
                  <v-list-item
                    :key="item.url"
                    color="primary"
                    dense
                    link
                    @click="redirect(item)"
                  >
                    <v-list-item-icon :class="`bloque--configuraciones ml-1 mr-1`">
                      <v-icon-component :icon="item.icono" class="primary--text"></v-icon-component>
                    </v-list-item-icon>
                    <v-list-item-content>
                      <v-list-item-title class="ruta--menu fontColor--text fs9">
                        {{ item.label }}
                      </v-list-item-title>
                    </v-list-item-content>
                  </v-list-item>
                </template>
              </template>

            </v-card>
          </v-dialog>
    </v-app-bar>
  </div>
</template>

<script>
import systemAppearance from 'system-appearance';
import { mapState } from 'vuex';
import Auth from '@/components/auth/mixins/auth';
import vIconComponent from '@/plugins/icon/index.vue';

export default {
  mixins: [Auth],
  data: () => ({
    clipped: false,
    apps: false,
    modalSettings: false,
    rutas: [],
    roles: [],
    themeVerify: false,
    aSettings: [],
    radioGroup: null,
    rol: '',
    baseDescargaManuales: process.env.VUE_APP_FRONTEND + process.env.VUE_APP_PUBLIC_PATH + 'pdf/',
  }),
  components: {
    vIconComponent
  },
  methods: {
    setDrawer () {
      this.$storage.set('drawer', !this.drawer);
      this.$root.$refs.AppSideBar.updateStateSidebar();
    },
    darkModeListener() {
      if (this.themeVerify || this.$storage.get('theme') == null) {
        this.$vuetify.theme.dark = true;
        this.$storage.set('theme', this.$vuetify.theme.dark);
      }
    },
    lightModeListener() {
      if (this.themeVerify || this.$storage.get('theme') == null) {
        this.$vuetify.theme.dark = false;
        this.$storage.set('theme', this.$vuetify.theme.dark);
      }
    },
    settings() {
      this.roles = this.$storage.get('roles');
      const { idRol } = this.$storage.get('rol');
      const modules = this.$storage.get('modules');
      const subMenus = modules.map(item => {
        const obj = {};
        obj.idRol = item.idRol;
        obj.nombre = item.nombre;
        obj.idOlimpiada = item.olimpiadas[0].id;
        obj.rol = item.rol;
        return obj;
      });
      this.radioGroup = idRol;
      const user = this.$storage.getUser();
      this.aSettings = [
        {
          icono: 'person',
          url: '/perfil',
          label: `${user.nombres} ${user.primerApellido ? user.primerApellido : ''} ${user.segundoApellido ? user.segundoApellido : ''}`
        },
        {
          icono: 'switch_account',
          label: 'Cambiar de rol',
          submenu: [...subMenus]
        },
        {
          icono: 'logout',
          label: 'Cerrar sesion'
        }
      ];
      this.modalSettings = !this.modalSettings;
    },
    setTheme() {
      this.$vuetify.theme.dark = !this.$vuetify.theme.dark;
      this.$storage.set('theme', this.$vuetify.theme.dark);
    },
    async setRol({ rol, idRol, idOlimpiada }) {
      try {
        this.modalSettings = false;
        if (rol && idRol && idOlimpiada) {
          const response = await this.$service.post('change-rol', {
            idRol,
            idOlimpiada
          });
          this.$storage.set('olimpiadaSeleccionada', null);
          this.$storage.set('etapaSeleccionada', null);
          this.$storage.set('areaSeleccionada', null);
          const { datos } = response;
          await this.setData(datos);
          const menus = this.getModules(this.$storage.get('modules'), rol);
          this.$storage.set('menu', menus);
          this.rol = rol;
          this.$store.commit('setMenu', menus);
          if (this.$route.path !== '/home') this.$router.push('/home');
          if (this.$route.path === '/home') this.reload();
        }
      } catch (error) {
        this.$message.error(error?.message || 'Ocurrio un problema');
      }
    },
    reload() {
      this.$store.commit('setMain', false);
      this.$nextTick(() => {
        this.$store.commit('setMain', true);
      });
    },
    redirect(subItem) {
      this.modalSettings = false;
      if (subItem && subItem.hasOwnProperty('url')) {
        if (this.$route.path.replace(/\//gi, '') !== subItem.url) {
          this.$router.push(subItem.url);
          setTimeout(() => {
            this.getParent();
          }, 100);
        }
      } else {
        if (subItem.icono === 'logout') {
          this.$confirm('¿Está seguro de cerrar la sesión?', () => {
            this.modalSettings = false;
            this.logout();
          });
        }
      }
    },
    hasNoSupport() {
      this.appearance = null;
      console.warn('You specified no preference for a color scheme or your browser does not support it.');
    }
  },
  computed: {
    ...mapState([
      'auth',
      'currentBackground',
      'stages',
      'areas',
      'selectedArea',
      'drawer'
    ])
  },
  mounted() {
    systemAppearance(this.darkModeListener, this.lightModeListener, this.hasNoSupport);
    this.$nextTick(async () => {
      this.rol = this.$storage.get('rol')?.rol;
      this.rutas = this.$storage.get('menu');
      this.$vuetify.theme.dark = this.$storage.get('theme');
      this.themeVerify = true;
    });
  },
  created() {
    this.$root.$refs.AppNavbar = this;
  }
};
</script>

<style lang="scss">
@import '../scss/variables.scss';

.navbar {
  .v-toolbar__content {
    border-bottom: thin solid rgba(0, 0, 0, 0.12) !important;
  }
  .isMobile {
    width: 200px;
    white-space: nowrap;
    overflow: hidden;
    text-overflow: ellipsis;
  }
}
.item--group {
  .v-list-group__header__prepend-icon {
    display: flex;
    flex-direction: row;
    align-items: center;
    justify-content: center;
    background: var(--color_fondo) !important;
    border-radius: 10px;
    min-width: 60px !important;
    width: 60px !important;
    min-height: 60px !important;
    height: 60px !important;
  }
}

.setting {
  .v-list-group__header__append-icon {
    display: none !important;
  }
}

@media screen and (min-width: 768px) {
  .settings {
    position: fixed;
    z-index: 10;
    min-width: 300px;
    right: 0;
    top: 65px;
    padding: 20px 0px 20px 0px;
    border-radius: 7px !important;
    background: $white;
    transition: top 0.3s ease-in;
    .v-list-group__header__append-icon {
      display: none !important;
    }
  }
  .text--ellipsis {
    text-overflow: ellipsis;
    max-width: 220px;
    white-space: nowrap;
    overflow: hidden;
  }
}

.listadoManuales {
  li {
    a {
      text-decoration: none;
      color: $info;
    }
  }
}

</style>
