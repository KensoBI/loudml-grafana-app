import { getDataSourceSrv } from '@grafana/runtime';
import { AppEvents } from '@grafana/data';
import { CoreEvents } from 'grafana/app/types';
import appEvents from 'grafana/app/core/app_events';

import LoudMLAPI from './loudml_api';
import configTemplate from './partials/config.html';
import LoudMLDatasource from './datasource';
import { DEFAULT_MODEL, DEFAULT_JOB } from './types';

export class LoudMLConfigCtrl {
  static template = configTemplate;
  ACCESS_OPTIONS = [
    { key: 'proxy', value: 'Server (Default)' },
    { key: 'direct', value: 'Browser' },
  ];

  current: any;

  showAccessHelp = false;
  modelsList = [];
  jobsList = [];
  scheduledList = [];
  job: any;

  constructor(private $scope: any) {
    // window.console.log($scope);

    if (this.$scope.current === undefined) {
      this.$scope.current = {
        url: '',
        access: 'proxy',
      };
    }
  }

  toggleAccessHelp() {
    this.showAccessHelp = !this.showAccessHelp;
  }

  async refreshModels() {
    this.$scope.ctrl.modelsList = [{ is_loading: true, settings: { name: 'Loading...' }, state: { trained: '' } }];

    const ds = (await getDataSourceSrv().loadDatasource(this.current.name)) as LoudMLDatasource;

    try {
      ds.query({ url: '/models', params: {} }).then(response => {
        this.$scope.ctrl.modelsList = response;
        this.$scope.$apply();
      });

      ds.query({ url: '/jobs', params: {} }).then(response => {
        this.$scope.ctrl.jobsList = response;
        this.$scope.$apply();
      });

      ds.query({ url: '/scheduled_jobs', params: {} }).then(response => {
        this.$scope.ctrl.scheduledList = response;
        this.$scope.$apply();
      });
    } catch (err) {
      console.error(err);
      appEvents.emit(AppEvents.alertError, [err]);
    }
  }

  addModel() {
    const model = DEFAULT_MODEL;
    appEvents.emit('show-modal', {
      src: '/public/plugins/grafana-loudml-app/datasource/partials/add_model.html',
      modalClass: 'confirm-modal',
      model: model,
    });
  }

  editModel(name: any) {
    window.console.log(name);
    const model = this.$scope.ctrl.modelsList.find(el => el.settings.name === name);
    window.console.log(model);

    // appEvents.emit(CoreEvents.showModal, {
    appEvents.emit('show-modal', {
      src: '/public/plugins/grafana-loudml-app/datasource/partials/edit_model.html',
      modalClass: 'confirm-modal',
      model: model,
    });
  }

  addJob() {
    this.job = Object.assign({}, DEFAULT_JOB);

    appEvents.emit('show-modal', {
      src: '/public/plugins/grafana-loudml-app/datasource/partials/add_job.html',
      modalClass: 'confirm-modal',
      model: this
    });
  }

  async scheduleJob() {
    window.console.log(this.job);
    const ds = (await getDataSourceSrv().loadDatasource(this.current.name)) as LoudMLDatasource;
    try {
      ds.loudml.scheduleJob(this.job).then(response => {
        window.console.log(response);
        appEvents.emit(AppEvents.alertSuccess, ['Job has been scheduled on Loud ML server']);
        this.refreshModels();
      });
    } catch (err) {
      console.error(err);
      appEvents.emit(AppEvents.alertError, ['Job schedule error', err]);
    }
  }

  async startModel(name: any) {
    const ds = (await getDataSourceSrv().loadDatasource(this.current.name)) as LoudMLDatasource;

    try {
      ds.loudml.startModel(name).then(response => {
        window.console.log(response);
        appEvents.emit(AppEvents.alertSuccess, ['Model has been started on Loud ML server']);
        this.refreshModels();
      });
    } catch (err) {
      console.error(err);
      appEvents.emit(AppEvents.alertError, ['Model start error', err]);
    }
  }

  async stopModel(name: any) {
    const ds = (await getDataSourceSrv().loadDatasource(this.current.name)) as LoudMLDatasource;

    try {
      ds.loudml.stopModel(name).then(response => {
        window.console.log(response);
        appEvents.emit(AppEvents.alertSuccess, ['Model has been stoped on Loud ML server']);
        this.refreshModels();
      });
    } catch (err) {
      console.error(err);
      appEvents.emit(AppEvents.alertError, ['Model stop error', err]);
    }
  }

  async forecastModel(name: any) {
    window.console.log('FORECAST MODEL');
  }

  async trainModel(name: any) {
    window.console.log('TRAIN MODEL');
  }

  async deleteModel(name: any) {
    const ds = (await getDataSourceSrv().loadDatasource(this.current.name)) as LoudMLDatasource;

    try {
      ds.loudml.deleteModel(name).then(response => {
        window.console.log(response);
        appEvents.emit(AppEvents.alertSuccess, ['Model has been deleted on Loud ML server']);
        this.refreshModels();
      });
    } catch (err) {
      console.error(err);
      appEvents.emit(AppEvents.alertError, ['Model delete error', err]);
    }
  }
}
