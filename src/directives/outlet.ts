/**
 * @license
 * Copyright (c) 2016 Thomas Pink
 *
 * Use of this source code is governed by the MIT-style license that can be
 * found in the LICENSE file at https://github.com/thomaspink/ng-storyblok/blob/master/LICENSE
 */

import {
  Directive, ComponentFactoryResolver, Input, Output, EventEmitter,
  ViewContainerRef, OnChanges, OnDestroy, Inject, ComponentRef, Injector,
  ResolvedReflectiveProvider, ComponentFactory, ReflectiveInjector, SimpleChange
} from '@angular/core';
import { SBComponent } from '../db/model';
import { SBSerializer } from '../db/serializer';
import { SBComponentSchema } from '../db/schema';
import { SBConfig } from '../config';

/**
 * The SBOutlet Directive acts as a placeholder for
 * dynamically creating components based on a provided list.
 *
 * @export
 * @class SBOutlet
 * @implements {OnChanges}
 */
@Directive({ selector: 'sb-outlet' })
export class SBOutlet implements OnChanges, OnDestroy {
  private activated: ComponentRef<any>[];
  private _model: SBComponent[] = [];

  @Output('activate') activateEvents = new EventEmitter<any>();
  @Output('deactivate') deactivateEvents = new EventEmitter<any>();
  @Input('model') set model(values: SBComponent[] | SBComponentSchema[]) {
    if (Array.isArray(values) && values.length)
      this._model = (<Array<SBComponent | SBComponentSchema>>values).map((c) =>
        c instanceof SBComponent ? c : this._serializer.normalizeComponent(c));
    else
      this._model = [];
  }

  constructor(private resolver: ComponentFactoryResolver, private location: ViewContainerRef,
    private _serializer: SBSerializer, private config: SBConfig) { }

  /* @internal */
  ngOnDestroy() { this.deactivate(); }

  /* @internal */
  ngOnChanges() {
    if (!Array.isArray(this._model)) {
      throw new Error(`You have to provide the component schemas as an array to the sb-outlet`);
    }
    this.deactivate();
    this.activate(this._model, null, null, []);
  }

  get isActivated(): boolean { return !!this.activated && !!this.activated.length; }
  get components() {
    if (!this.activated) throw new Error('sb-outlet is not activated');
    return this.activated;
  }

  /**
   * Activates, creates and renders components after the sb-outlet element.
   *
   * @param {SBComponent[]} schemas
   * @param {ComponentFactoryResolver} loadedResolver
   * @param {Injector} loadedInjector
   * @param {ResolvedReflectiveProvider[]} providers
   * @returns {ComponentRef<any>[]}
   *
   * @memberOf SBOutlet
   */
  activate(schemas: SBComponent[], loadedResolver: ComponentFactoryResolver,
    loadedInjector: Injector, providers: ResolvedReflectiveProvider[]): ComponentRef<any>[] {
    if (this.isActivated) {
      throw new Error('Cannot activate an already activated sb-outlet');
    }

    this.activated = schemas.map(s => {
      return this._activateComponent(s, null, null, []);
    });
    this.activateEvents.emit(this.activated);
    return this.activated;
  }

  /* @internal */
  private _activateComponent<C>(schema: SBComponent, loadedResolver: ComponentFactoryResolver,
    loadedInjector: Injector, providers: ResolvedReflectiveProvider[]): ComponentRef<C> {

    if (!this.config.map) {
      throw new Error(
        `Cannot activate component in sb-outlet if no map is provided in the config.`);
    }
    const componentType = this.config.map[schema.type];
    if (!componentType) {
      throw new Error(
        `Cannot activate component because the map in the config ` +
        `has no entry for "${schema.type}".`);
    }

    let factory: ComponentFactory<any>;
    if (loadedResolver) {
      factory = loadedResolver.resolveComponentFactory(componentType);
    } else {
      factory = this.resolver.resolveComponentFactory(componentType);
    }

    const injector = loadedInjector ? loadedInjector : this.location.parentInjector;
    const inj = ReflectiveInjector.fromResolvedProviders(providers, injector);
    const ref = this.location.createComponent(factory, this.location.length, inj, []);

    const changes = {};
    for (let key in schema.model) {
      const value = schema.model[key];
      if (schema.model.hasOwnProperty(key) && value !== ref.instance[key]) {
        changes[key] = new SimpleChange(ref.instance[key], value);
        ref.instance[key] = value;
      }
    }

    if (typeof ref.instance.ngOnChanges === 'function') {
      ref.instance.ngOnChanges(changes);
    }

    ref.changeDetectorRef.detectChanges();
    return ref;
  }

  /**
   * Deactivates and destroys all active components.
   *
   * @memberOf SBOutlet
   */
  deactivate() {
    if (this.activated) {
      const cnts = this.components;
      this.activated.forEach(c => { c.destroy(); });
      this.activated = null;
      this.deactivateEvents.emit(cnts);
    }
  }

}
