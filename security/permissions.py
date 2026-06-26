# Role-Based Access Control (RBAC) Permissions Matrix

ROLES = {
    'citizen': {
        'submit_request': True,
        'view_dashboard': False,
        'view_pii': False,
        'approve_dispatch': False,
        'update_inventory': False
    },
    'field_responder': {
        'submit_request': False,
        'view_dashboard': True,
        'view_pii': False,       # Only allowed when request is fully approved and assigned
        'approve_dispatch': False,
        'update_inventory': False
    },
    'coordinator': {
        'submit_request': True,
        'view_dashboard': True,
        'view_pii': True,
        'approve_dispatch': True,
        'update_inventory': True
    }
}

def check_permission(role: str, permission: str) -> bool:
    """Verifies if the specified role has the required operational permission."""
    role_perms = ROLES.get(role, ROLES['citizen'])
    return role_perms.get(permission, False)
