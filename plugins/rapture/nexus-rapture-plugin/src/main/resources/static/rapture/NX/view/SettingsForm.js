/*
 * Sonatype Nexus (TM) Open Source Version
 * Copyright (c) 2008-2015 Sonatype, Inc.
 * All rights reserved. Includes the third-party code listed at http://links.sonatype.com/products/nexus/oss/attributions.
 *
 * This program and the accompanying materials are made available under the terms of the Eclipse Public License Version 1.0,
 * which accompanies this distribution and is available at http://www.eclipse.org/legal/epl-v10.html.
 *
 * Sonatype Nexus (TM) Professional Version is available from Sonatype, Inc. "Sonatype" and "Sonatype Nexus" are trademarks
 * of Sonatype, Inc. Apache Maven is a trademark of the Apache Software Foundation. M2eclipse is a trademark of the
 * Eclipse Foundation. All other trademarks are the property of their respective owners.
 */
/*global Ext*/

/**
 * Abstract settings form.
 *
 * @since 3.0
 */
Ext.define('NX.view.SettingsForm', {
  extend: 'Ext.form.Panel',
  alias: 'widget.nx-settingsform',
  ui: 'nx-subsection',
  frame: true,
  requires: [
    'NX.I18n'
  ],

  /**
   * @private
   * Set trackResetOnLoad by default
   */
  constructor : function(config) {
    config = config || {};
    config.trackResetOnLoad = true;
    this.callParent([config]);
  },

  /**
   * @cfg {boolean} [settingsForm=true] Marker that we have a settings form
   * ({NX.controller.SettingsForm} controller kicks in)
   */
  settingsForm: true,

  /**
   * @cfg {boolean} [settingsFormSubmit=true] True if settings form should be submitted automatically when 'submit'
   * button is clicked. Set this to false if custom processing is needed.
   */
  settingsFormSubmit: true,

  /**
   * @cfg {boolean} [settingsFormSubmitOnEnter=false] True if form should be submitted on Enter.
   */
  settingsFormSubmitOnEnter: false,

  /**
   * @cfg {string/function} Text to be used when displaying submit/load messages. If is a function it will be called
   * with submit/load response data as parameter and it should return a String.
   * If text contains "${action}", it will be replaced with performed action.
   */
  settingsFormSuccessMessage: undefined,

  /**
   * @cfg {string/function} [settingsFormLoadMessage: 'Loading...'] Text to be used as mask while loading data.
   */
  settingsFormLoadMessage: NX.I18n.get('GLOBAL_SETTINGS_LOADING'),

  /**
   * @cfg {string/function} [settingsFormSubmitMessage: 'Saving...'] Text to be used as mask while submitting data.
   */
  settingsFormSubmitMessage: NX.I18n.get('GLOBAL_SETTINGS_SAVING'),

  /**
   * @cfg {NX.util.condition.Condition} The condition to be satisfied in order for this form to be editable.
   */
  editableCondition: undefined,

  /**
   * @cfg {string} Optional text to be shown in case that form is not editable (condition is not satisfied).
   */
  editableMarker: undefined,

  autoScroll: true,
  waitMsgTarget: true,

  defaults: {
    xtype: 'textfield',
    allowBlank: false
  },

  buttonAlign: 'left',

  buttons: [
    { text: NX.I18n.get('GLOBAL_BUTTON_SAVE'), formBind: true, action: 'save', ui: 'nx-primary', bindToEnter: false },
    { text: NX.I18n.get('GLOBAL_BUTTON_DISCARD'),
      handler: function () {
        var form = this.up('form'),
            record = form.getRecord();

        if (record) {
          form.loadRecord(record);
          form.isValid();
        }
        else if (form.api && form.api.load) {
          form.fireEvent('load', form);
        }
        else {
          form.getForm().reset();
          form.isValid();
        }
      }
    }
  ],

  /**
   * @override
   */
  initComponent: function () {
    var me = this;

    if (me.buttons && Ext.isArray(me.buttons) && me.buttons[0] && Ext.isDefined(me.buttons[0].bindToEnter)) {
      me.buttons[0].bindToEnter = me.settingsFormSubmitOnEnter;
    }

    me.on('recordloaded', me.resetDirtyState);
    me.on('loaded', me.resetDirtyState);
    me.on('submitted', me.resetDirtyState);

    me.callParent(arguments);

    me.addEvents(
        /**
         * @event recordloaded
         * Fires when a record is loaded via {@link Ext.form.Panel#loadRecord}.
         * @param {Ext.form.Panel} this form
         * @param {Ext.data.Model} loaded record
         */
        'recordloaded',
        /**
         * @event loaded
         * Fires after form was loaded via configured api.
         * @param {Ext.form.Panel} this form
         * @param {Ext.form.action.Action} load action
         */
        'loaded',
        /**
         * @event submitted
         * Fires after form was submitted via configured api.
         * @param {Ext.form.Panel} this form
         * @param {Ext.form.action.Action} submit action
         */
        'submitted'
    );
  },

  /**
   * @override
   * Fires 'recordloaded' after record was loaded.
   */
  loadRecord: function (record) {
    var me = this;

    me.callParent(arguments);
    me.fireEvent('recordloaded', me, record);
  },

  /*
   * @private
   * Reset the dirty state of the form
   */
  resetDirtyState: function (form) {
    var realform = form.getForm();
    realform.setValues(realform.getValues());
  },

  /**
   * @public
   * Sets the read only state for all fields of this form.
   * @param {boolean} editable
   */
  setEditable: function (editable) {
    var me = this,
        itemsToDisable = me.getChildItemsToDisable(),
        bottomBar;

    if (editable) {
      Ext.Array.each(itemsToDisable, function (item) {
        var enable = true,
            form;

        if (item.resetEditable) {
          if (Ext.isFunction(item.setReadOnly)) {
            item.setReadOnly(false);
          }
          else {
            if (Ext.isDefined(item.resetFormBind)) {
              item.formBind = item.resetFormBind;
            }
            if (item.formBind) {
              form = item.up('form');
              if (form && !form.isValid()) {
                enable = false;
              }
            }
            if (enable) {
              item.enable();
            }
          }
        }
        if (Ext.isDefined(item.resetEditable)) {
          delete item.resetEditable;
          delete item.resetFormBind;
        }
      });
    }
    else {
      Ext.Array.each(itemsToDisable, function (item) {
        if (Ext.isFunction(item.setReadOnly)) {
          if (item.resetEditable !== false && !item.readOnly) {
            item.setReadOnly(true);
            item.resetEditable = true;
          }
        }
        else {
          if (item.resetEditable !== false && !item.disabled) {
            item.disable();
            item.resetFormBind = item.formBind;
            delete item.formBind;
            item.resetEditable = true;
          }
        }
      });
    }

    bottomBar = me.getDockedItems('toolbar[dock="bottom"]')[0];
    if (bottomBar) {
      if (editable) {
        if (bottomBar.editableMarker) {
          bottomBar.remove(bottomBar.editableMarker);
        }
      }
      else {
        if (me.editableMarker) {
          bottomBar.editableMarker = Ext.widget({
            xtype: 'label',
            text: me.editableMarker,
            // TODO replace style with css class?
            style: {
              fontSize: '10px',
              fontWeight: 'bold'
            }
          });
          bottomBar.add(bottomBar.editableMarker);
        }
      }
    }
  }

});
