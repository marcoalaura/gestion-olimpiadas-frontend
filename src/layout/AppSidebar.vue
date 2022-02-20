<template>
  <v-card elevation="0">
    <v-navigation-drawer
      v-model="drawer"
      app
      floating
      :mini-variant-width="0"
    >
      <template v-for="item in menus">
        <!-- SI TIENE SUBMODULOS -->
        <template v-if="item.subModulo && item.subModulo.length > 0">
          <v-list-group
            :key="item.url"
            :value="true"
            disabled
          >
            <template v-slot:activator>
              <v-list-item-content>
                <v-list-item-title>
                  <div class="grey--text font-weight-regular">
                    {{ item.label }}
                  </div>
                </v-list-item-title>
              </v-list-item-content>
            </template>

            <v-list-item
              v-for="subItem in item.subModulo"
              :key="subItem.label"
              @click="redirect(subItem)"
              class="ml-0 d-flex flex-row align-center justify-center"
              :class="$route.path === subItem.url ? 'item--active' : ''"
            >
              <v-list-item-icon
                class="primary--text ml-3"
                :style="`--color_fondo: ${$vuetify.theme.dark ? subItem.propiedades.color_dark:subItem.propiedades.color_light}; margin-right: 22px`"
              >
                <v-icon-component :icon="subItem.propiedades.icono"></v-icon-component>
              </v-list-item-icon>
              <v-list-item-content class="pa-0">
                <v-list-item-title
                  class="fontColor--text fs9 fwb"
                  v-text="subItem.label"
                ></v-list-item-title>
              </v-list-item-content>
            </v-list-item>
          </v-list-group>
        </template>
      </template>
    </v-navigation-drawer>
  </v-card>
</template>
<script>
import vIconComponent from '@/plugins/icon/index.vue';
import Auth from '@/components/auth/mixins/auth';

export default {
  mixins: [Auth],
  data: () => ({
    drawer: true
  }),
  components: {
    vIconComponent
  },
  computed: {
    menus () {
      if (this.$store.state.menu.length > 0) return this.$store.state.menu;
      return this.$storage.get('menu');
    }
  },
  methods: {
    deleteLink () {
      setTimeout(() => {
        const dom = document.querySelectorAll('.v-list-group--active');
        Object.keys(dom).filter(elem => dom[elem].firstChild.classList.add('pointer-events'));
      }, 100);
    },
    updateStateSidebar() {
      this.drawer = !this.drawer;
    },
    redirect(subItem) {
      if (subItem && subItem.hasOwnProperty('url')) {
        if (this.$route.path.replace(/\//gi, '') !== subItem.url) {
          this.$router.push(subItem.url);
        }
      } else {
        if (subItem.icono === 'logout') {
          this.$confirm('¿Está seguro de cerrar la sesión?', () => {
            this.logout();
          });
        }
      }
    },
  },
  mounted () {
    this.$nextTick(() => {
      this.deleteLink();
      this.drawer = this.$vuetify.breakpoint.name === 'lg';
    });
  },
  created() {
    this.$root.$refs.AppSideBar = this;
  }
};
</script>
<style lang="scss">
@import '../scss/variables.scss';
.item--active {
  background: $linkActive;
}
.v-navigation-drawer {
  top: 60px !important;
  padding-bottom: 110px !important;
  .v-list-group__header__append-icon {
    display: none !important;
  }
  .v-list-item {
    height: 42px !important;
    min-height: 42px !important;
  }
  .v-list-item__icon {
    margin-top: 4px !important;
    margin-bottom: 0 !important;
    margin-right: 5px !important;
  }
  .v-list-item__title,
  .v-list-item__subtitle {
    white-space: normal !important;
  }
}
</style>
