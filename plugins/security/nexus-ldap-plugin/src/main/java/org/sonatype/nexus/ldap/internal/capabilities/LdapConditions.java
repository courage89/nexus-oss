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
package org.sonatype.nexus.ldap.internal.capabilities;

import javax.inject.Inject;
import javax.inject.Named;
import javax.inject.Singleton;

import org.sonatype.nexus.capability.Condition;
import org.sonatype.nexus.ldap.internal.persist.LdapConfigurationManager;
import org.sonatype.sisu.goodies.eventbus.EventBus;

import static com.google.common.base.Preconditions.checkNotNull;

/**
 * Factory of {@link Condition}s related to LDAP.
 *
 * @since 2.4.1
 */
@Named
@Singleton
public class LdapConditions
{

  private final EventBus eventBus;

  private final LdapConfigurationManager ldapConfigurationManager;

  @Inject
  public LdapConditions(final EventBus eventBus,
                        final LdapConfigurationManager ldapConfigurationManager)
  {
    this.eventBus = checkNotNull(eventBus);
    this.ldapConfigurationManager = checkNotNull(ldapConfigurationManager);
  }

  /**
   * Creates a new condition that is satisfied when an LDAP server exists.
   *
   * @param ldapServerId getter for LDAP server id (usually condition specific property)
   * @return created condition
   */
  public Condition ldapServerExists(final LdapServerId ldapServerId) {
    return new LdapServerExistsCondition(eventBus, ldapConfigurationManager, ldapServerId);
  }

  public static interface LdapServerId
  {

    String get();

  }

}
