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
package org.sonatype.nexus.security.user;

import java.util.Collection;
import java.util.HashSet;
import java.util.List;
import java.util.Set;

import javax.inject.Inject;
import javax.inject.Named;
import javax.inject.Singleton;

import org.sonatype.nexus.common.text.Strings2;
import org.sonatype.nexus.security.SecuritySystem;
import org.sonatype.nexus.security.config.CUserRoleMapping;
import org.sonatype.nexus.security.config.SecurityConfigurationManager;

import com.google.common.collect.Sets;
import org.eclipse.sisu.Description;

/**
 * This allows you to easily search for users that have added roles.
 * For example if your users generally come from an external Realm (LDAP) you could see which users have had roles
 * added to them.
 */
@Singleton
@Named("allConfigured")
@Description("All Configured Users")
public class ConfiguredUsersUserManager
    extends AbstractReadOnlyUserManager
{
  private final SecuritySystem securitySystem;

  private final SecurityConfigurationManager configuration;

  public static final String SOURCE = "allConfigured";

  @Inject
  public ConfiguredUsersUserManager(final SecuritySystem securitySystem,
                                    final SecurityConfigurationManager configuration)
  {
    this.securitySystem = securitySystem;
    this.configuration = configuration;
  }

  @Override
  public String getSource() {
    return SOURCE;
  }

  @Override
  public Set<User> listUsers() {
    Set<User> users = new HashSet<User>();

    List<CUserRoleMapping> userRoleMappings = this.configuration.listUserRoleMappings();
    for (CUserRoleMapping userRoleMapping : userRoleMappings) {
      try {
        User user = this.getSecuritySystem().getUser(userRoleMapping.getUserId(), userRoleMapping.getSource());
        if (user != null) {
          users.add(user);
        }
      }
      catch (UserNotFoundException e) {
        log.warn("User: '{}' of source: '{}' could not be found.",
            userRoleMapping.getUserId(), userRoleMapping.getSource());
        log.debug("Most likely caused by a user role mapping that is invalid.", e);
      }
      catch (NoSuchUserManagerException e) {
        log.warn("User: '{}' of source: '{}' could not be found.",
            userRoleMapping.getUserId(), userRoleMapping.getSource(), e);
      }
    }

    return users;
  }

  @Override
  public Set<String> listUserIds() {
    Set<String> userIds = new HashSet<String>();

    List<CUserRoleMapping> userRoleMappings = this.configuration.listUserRoleMappings();
    for (CUserRoleMapping userRoleMapping : userRoleMappings) {
      String userId = userRoleMapping.getUserId();
      if (Strings2.isNotEmpty(userId)) {
        userIds.add(userId);
      }
    }

    return userIds;
  }

  @Override
  public User getUser(String userId) {
    // this resource will only list the users
    return null;
  }

  @Override
  public Set<User> searchUsers(UserSearchCriteria criteria) {
    // we only want to do this if the criteria is set to the source
    if (this.getSource().equals(criteria.getSource())) {
      return this.filterListInMemeory(this.listUsers(), criteria);
    }
    else {
      return new HashSet<User>();
    }
  }

  private SecuritySystem getSecuritySystem() {
    return this.securitySystem;
  }

  @Override
  protected boolean matchesCriteria(final String userId,
                                    final String userSource,
                                    final Collection<String> usersRoles,
                                    final UserSearchCriteria criteria)
  {
    // basically the same as the super, but we don't want to check the source
    if (Strings2.isNotEmpty(criteria.getUserId())
        && !userId.toLowerCase().startsWith(criteria.getUserId().toLowerCase())) {
      return false;
    }

    if (criteria.getOneOfRoleIds() != null && !criteria.getOneOfRoleIds().isEmpty()) {
      Set<String> userRoles = new HashSet<String>();
      if (usersRoles != null) {
        userRoles.addAll(usersRoles);
      }

      // check the intersection of the roles
      if (Sets.intersection(criteria.getOneOfRoleIds(), userRoles).isEmpty()) {
        return false;
      }
    }

    return true;
  }

  @Override
  public String getAuthenticationRealmName() {
    return null;
  }
}