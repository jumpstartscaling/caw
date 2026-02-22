"""Auth disabled - login/logout redirect to admin."""
from fastapi import APIRouter
from fastapi.responses import RedirectResponse

router = APIRouter(prefix="/admin", tags=["auth"])


@router.get("/login")
@router.post("/login")
async def login_redirect():
    """Auth disabled - redirect to admin index."""
    return RedirectResponse(url="/admin/", status_code=302)


@router.get("/logout")
@router.post("/logout")
async def logout_redirect():
    """Auth disabled - redirect to admin index."""
    return RedirectResponse(url="/admin/", status_code=302)
