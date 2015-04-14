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
/*global Ext, NX*/

/**
 * Refresh controller.
 *
 * @since 3.0
 */
Ext.define('NX.controller.Tutorial', {
  extend: 'Ext.app.Controller',

  views: [
    'header.Tutorial',
    'tutorial.Panel'
  ],

  steps: [
    'start',
    'end'
  ],

  currentStep: 0,
  currentTip: null,

  refs: [
    {
      ref: 'tutorials',
      selector: 'nx-header-tutorial'
    },
    {
      ref: 'tutorial01',
      selector: 'nx-header-tutorial menuitem[action=start]'
    },
    {
      ref: 'tutorial02',
      selector: 'nx-header-tutorial menuitem[action=next]'
    }
  ],

  /**
   * @override
   */
  init: function() {
    var me = this;

    me.getApplication().getIconController().addIcons({
      'tutorial-available': {
        file: 'wrench.png',
        variants: ['x16', 'x32']
      },
      'tutorial-in-progress': {
        file: 'progressbar.png',
        variants: ['x16', 'x32']
      },
      'tutorial-finished': {
        file: 'tick.png',
        variants: ['x16', 'x32']
      },
      'tutorial-unavailable': {
        file: 'lock.png',
        variants: ['x16', 'x32']
      }
    });

    me.listen({
      component: {
        'nx-header-tutorial': {
          boxready: me.onTutorialPrompt
        },
        'nx-header-tutorial menuitem[action=start]': {
          click: me.onInitTutorial
        },
        'nx-header-user-mode': {
          click: me.onStep1
        },
        'nx-authenticate': {
          boxready: me.onStep2
        },
        'nx-authenticate textfield[name=password]': {
          change: me.onStep3
        },
        'nx-coreui-user-changepassword': {
          boxready: me.onStep4
        },
        'nx-coreui-user-changepassword textfield[name=password]': {
          blur: me.onStep5
        },
        'nx-coreui-user-changepassword textfield:not([name=password])': {
          change: me.onStep6
        },
        'nx-coreui-user-changepassword button[action=changepassword]': {
          click: me.onStep7
        }
      }
    });

    me.callParent(arguments);
  },

  /**
   * @private
   * Helper function to show a callout with some intelligent defaults
   */
  showTip: function(tip) {
    var me = this,
      defaults = {
        target: 'nx-header-tutorial',
        calloutArrowLocation: 'top',
        relativePosition: 't-b',
        cls: 'yellow',
        width: 200,
        fadeInDuration: 400,
        autoHide: false,
        alwaysOnTop: true,
        focusOnToFront: false,
        html: 'Click this'
      };

    // Destroy existing tooltip, if it exists
    me.clearTip();

    // Apply defaults
    Ext.apply(defaults, tip);

    // Add an offset based on the callout arrow location
    if (defaults.calloutArrowLocation == 'top') {
      defaults.relativeOffsets = [0, 15];
    } else if (defaults.calloutArrowLocation == 'left') {
      defaults.relativeOffsets = [15, 0];
    }

    // Create the tooltip
    me.currentTip = Ext.create('Ext.ux.callout.Callout', defaults);
    me.currentTip.show();

    // Bring the tooltip to the front
    Ext.Function.defer(function() {
      me.currentTip.zIndexManager.bringToFront(me.currentTip);
    }, 10);
  },

  /**
   * @private
   * Helper function to clear the tooltip
   */
  clearTip: function() {
    var me = this;

    if (me.currentTip) {
      me.currentTip.destroy();
    }
  },

  /**
   * @private
   * Helper function to prompt the user to start the tutorial
   */
  onTutorialPrompt: function() {
    var me = this;

    // Create a tutorial prompt
    me.showTip({
      html: 'Welcome to Nexus. Here are some tutorials to help you get the most from your installation.',
      autoHide: true
    });
  },

  /**
   * @private
   * Helper function to initialize the tutorial
   */
  onInitTutorial: function() {
    var me = this,
      tutorial01 = me.getTutorial01();

    // Set the step counter
    me.currentStep = 1;

    // Navigate to a consistent starting point
    NX.getApplication().getController('Menu').changeMode('browse');
    NX.getApplication().getController('Menu').refreshModeButtons();

    // Show the first tooltip
    me.showTip({
      target: 'nx-header-user-mode',
      html: 'Click the user icon'
    });

    // Start progress
    tutorial01.setIconCls('nx-icon-tutorial-in-progress-x16');
  },

  /**
   * @private
   */
  onStep1: function() {
    var me = this;

    if (me.currentStep == 1) {
      me.showTip({
        target: 'nx-coreui-user-account button[action=changepassword]',
        html: 'Change your password'
      });

      me.currentStep++;
    }
  },

  /**
   * @private
   */
  onStep2: function() {
    var me = this;

    if (me.currentStep == 2) {
      Ext.Function.defer(function() {
        me.showTip({
          target: 'nx-authenticate textfield[name=password]',
          calloutArrowLocation: 'left',
          relativePosition: 'l-r',
          html: 'Password: admin123'
        });

        me.currentStep++;
      }, 10);
    }
  },

  /**
   * @private
   */
  onStep3: function(cmp, val) {
    var me = this;

    if (val == "admin123") {
      if (me.currentStep == 3) {
        me.showTip({
          target: 'nx-authenticate button[action=authenticate]',
          html: 'Authenticate yourself'
        });

        me.currentStep++;
      }
    }
  },

  /**
   * @private
   */
  onStep4: function() {
    var me = this;

    if (me.currentStep == 4) {
      Ext.Function.defer(function() {
        me.showTip({
          target: 'nx-coreui-user-changepassword textfield[name=password]',
          calloutArrowLocation: 'left',
          relativePosition: 'l-r',
          html: 'Choose a new password'
        });

        me.currentStep++;
      }, 10);
    }
  },

  /**
   * @private
   */
  onStep5: function() {
    var me = this;

    if (me.currentStep == 5) {
      me.showTip({
        target: 'nx-coreui-user-changepassword textfield:not([name=password])',
        calloutArrowLocation: 'left',
        relativePosition: 'l-r',
        html: 'Confirm your new password'
      });
    }
  },

  /**
   * @private
   */
  onStep6: function(cmp, val) {
    var me = this;

    var password = Ext.ComponentQuery.query('nx-coreui-user-changepassword textfield[name=password]')[0];
    var value = password.getValue();

    if (val == value) {
      if (me.currentStep == 5) {
        me.showTip({
          target: 'nx-coreui-user-changepassword button[action=changepassword]',
          html: 'Confirm your changes'
        });

        me.currentStep++;
      }
    }
  },

  /**
   * @private
   */
  onStep7: function() {
    var me = this,
      tutorial01 = me.getTutorial01(),
      tutorial02 = me.getTutorial02(),
      tutorials = me.getTutorials();

    if (me.currentStep == 6) {
      me.clearTip();

      // Show the completion modal
      Ext.defer(
        function() {
          Ext.create('NX.view.tutorial.Panel', {
            title: "Tutorial complete (1/10)",
            message: "<p>Are you ready for the next tutorial?</p>",
            iconCls: "nx-icon-tutorial-finished-x16"
          });
        }, 1000);

      // Change the tutorial icon to show completion
      tutorial01.setIconCls('nx-icon-tutorial-finished-x16');
      tutorial02.setIconCls('nx-icon-tutorial-available-x16');
      tutorials.setTooltip('1/10 tutorials completed');
    }
  }
});
