"""Pydantic schemas for Harris matrix (pSEO)."""
from typing import Any, Optional
from pydantic import BaseModel


class LocationCreate(BaseModel):
    city: str
    state: str
    zip: Optional[str] = None
    neighborhood: Optional[str] = None
    slug: Optional[str] = None


class LocationUpdate(BaseModel):
    city: Optional[str] = None
    state: Optional[str] = None
    zip: Optional[str] = None
    neighborhood: Optional[str] = None
    slug: Optional[str] = None


class LocationRead(BaseModel):
    id: int
    city: str
    state: str
    zip: Optional[str] = None
    neighborhood: Optional[str] = None
    slug: Optional[str] = None

    model_config = {"from_attributes": True}


class PseoServiceCreate(BaseModel):
    service_type: str
    sub_niche: Optional[str] = None
    slug: Optional[str] = None


class PseoServiceUpdate(BaseModel):
    service_type: Optional[str] = None
    sub_niche: Optional[str] = None
    slug: Optional[str] = None


class PseoServiceRead(BaseModel):
    id: int
    service_type: str
    sub_niche: Optional[str] = None
    slug: Optional[str] = None

    model_config = {"from_attributes": True}


class ContentMatrixCreate(BaseModel):
    location_id: Optional[int] = None
    service_id: Optional[int] = None
    slug: str
    title: Optional[str] = None
    meta_description: Optional[str] = None
    content_json: Optional[dict[str, Any]] = None


class ContentMatrixUpdate(BaseModel):
    location_id: Optional[int] = None
    service_id: Optional[int] = None
    slug: Optional[str] = None
    title: Optional[str] = None
    meta_description: Optional[str] = None
    content_json: Optional[dict[str, Any]] = None


class ContentMatrixRead(BaseModel):
    id: int
    location_id: Optional[int] = None
    service_id: Optional[int] = None
    slug: str
    title: Optional[str] = None
    meta_description: Optional[str] = None
    content_json: Optional[dict[str, Any]] = None

    model_config = {"from_attributes": True}


class MatrixPermutation(BaseModel):
    slug: str
    title: Optional[str] = None
    meta_description: Optional[str] = None
    location_city: Optional[str] = None
    location_state: Optional[str] = None
    service_type: Optional[str] = None
