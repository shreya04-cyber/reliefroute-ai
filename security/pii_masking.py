import re

def mask_name(name: str) -> str:
    """Mask citizen name for privacy, e.g., 'John Doe' -> 'J*** D***'"""
    if not name:
        return "Anonymous"
    parts = name.strip().split()
    masked_parts = []
    for p in parts:
        if len(p) > 1:
            masked_parts.append(p[0] + "*" * max(3, len(p) - 1))
        else:
            masked_parts.append(p + "***")
    return " ".join(masked_parts)

def mask_phone(phone: str) -> str:
    """Mask contact details for safety, e.g., '+91 98301 23456' -> '+91 ******3456'"""
    if not phone:
        return "N/A"
    # Remove whitespace
    cleaned = re.sub(r'\s+', '', phone)
    if len(cleaned) >= 8:
        return cleaned[:4] + "******" + cleaned[-4:]
    return "******" + (cleaned[-2:] if len(cleaned) > 2 else "")
