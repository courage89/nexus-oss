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
 * A {@link NX.util.condition.Condition} that is satisfied when any of OR-ed {@link NX.util.condition.Condition}s
 * is satisfied.
 *
 * @since 3.0
 */
Ext.define('NX.util.condition.Disjunction', {
  extend: 'NX.util.condition.Condition',

  /**
   * @cfg {NX.util.condition.Condition[]} Array of conditions to be OR-ed
   */
  conditions: undefined,

  bind: function () {
    var me = this;

    if (!me.bounded) {
      me.callParent();
      me.evaluate();
      Ext.each(me.conditions, function (condition) {
        me.mon(condition, {
          satisfied: me.evaluate,
          unsatisfied: me.evaluate,
          scope: me
        });
      });
    }

    return me;
  },

  evaluate: function () {
    var me = this,
        satisfied = false;

    if (me.bounded) {
      Ext.each(me.conditions, function (condition) {
        if(condition.satisfied){
          satisfied = true;
          return false;
        }
        return true;
      });
      me.setSatisfied(satisfied);
    }
  },

  toString: function () {
    var me = this;
    return me.conditions.join(' OR ');
  }

});