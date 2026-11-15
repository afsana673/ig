'use strict';

/**
 * Adapter-agnostic group invitation manager.
 *
 * GoatBot Instagram Adapter method names can differ by version/fork.
 * Supply the actual API method names through options.methods, or pass
 * custom functions through options.handlers.
 */
class GroupManager {
  constructor(api, options = {}) {
    if (!api || (typeof api !== 'object' && typeof api !== 'function')) {
      throw new TypeError('A GoatBot Instagram Adapter API instance is required.');
    }

    this.api = api;
    this.methods = {
      getPending: 'getPendingGroupInvitations',
      accept: 'acceptGroupInvitation',
      reject: 'rejectGroupInvitation',
      ...(options.methods || {})
    };
    this.handlers = options.handlers || {};
  }

  async _call(action, args) {
    const custom = this.handlers[action];
    if (typeof custom === 'function') {
      return await custom(this.api, ...args);
    }

    const methodName = this.methods[action];
    const method = this.api[methodName];
    if (typeof method !== 'function') {
      throw new Error(
        `Adapter method "${methodName}" for "${action}" was not found. ` +
        `Configure it with { methods: { ${action}: 'actualMethodName' } } ` +
        `or provide handlers.${action}.`
      );
    }
    return await method.apply(this.api, args);
  }

  async getPending(...args) {
    return this._call('getPending', args);
  }

  async accept(invitationId, ...args) {
    if (invitationId === undefined || invitationId === null || invitationId === '') {
      throw new TypeError('invitationId is required.');
    }
    return this._call('accept', [invitationId, ...args]);
  }

  async reject(invitationId, ...args) {
    if (invitationId === undefined || invitationId === null || invitationId === '') {
      throw new TypeError('invitationId is required.');
    }
    return this._call('reject', [invitationId, ...args]);
  }

  async _processAll(action, invitations, getId) {
    const list = Array.isArray(invitations) ? invitations : await this.getPending();
    const results = [];

    for (const invitation of list || []) {
      const id = getId(invitation);
      if (id === undefined || id === null || id === '') {
        results.push({ invitation, success: false, error: new Error('Could not determine invitation ID.') });
        continue;
      }
      try {
        const result = await this[action](id);
        results.push({ id, success: true, result });
      } catch (error) {
        results.push({ id, success: false, error });
      }
    }
    return results;
  }

  acceptAll(invitations, getId = defaultGetId) {
    return this._processAll('accept', invitations, getId);
  }

  rejectAll(invitations, getId = defaultGetId) {
    return this._processAll('reject', invitations, getId);
  }
}

function defaultGetId(invitation) {
  if (typeof invitation === 'string' || typeof invitation === 'number') return invitation;
  if (!invitation || typeof invitation !== 'object') return undefined;
  return invitation.id ?? invitation.invitationId ?? invitation.threadId ?? invitation.thread_id;
}

module.exports = GroupManager;
