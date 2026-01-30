import hashlib
from datetime import datetime
from typing import Optional
from bson import ObjectId
from motor.motor_asyncio import AsyncIOMotorDatabase

from ..models.feature import FeatureCreate, FeatureUpdate, FeatureResponse


class FeatureService:
    def __init__(self, db: AsyncIOMotorDatabase):
        self.collection = db.features

    async def create_feature(self, feature: FeatureCreate) -> FeatureResponse:
        now = datetime.utcnow()
        doc = {
            **feature.model_dump(),
            "created_at": now,
            "updated_at": now,
        }
        result = await self.collection.insert_one(doc)
        doc["id"] = str(result.inserted_id)
        return FeatureResponse(**doc)

    async def get_all_features(self, app_id: str | None = None) -> list[FeatureResponse]:
        query = {"app_id": app_id} if app_id else {}
        features = []
        async for doc in self.collection.find(query):
            doc["id"] = str(doc.pop("_id"))
            features.append(FeatureResponse(**doc))
        return features

    async def get_feature_by_id(self, feature_id: str) -> Optional[FeatureResponse]:
        doc = await self.collection.find_one({"_id": ObjectId(feature_id)})
        if doc:
            doc["id"] = str(doc.pop("_id"))
            return FeatureResponse(**doc)
        return None

    async def get_feature_by_key(self, key: str, app_id: str | None = None) -> Optional[FeatureResponse]:
        query = {"key": key}
        if app_id:
            query["app_id"] = app_id
        doc = await self.collection.find_one(query)
        if doc:
            doc["id"] = str(doc.pop("_id"))
            return FeatureResponse(**doc)
        return None

    async def update_feature(self, feature_id: str, update: FeatureUpdate) -> Optional[FeatureResponse]:
        update_data = {k: v for k, v in update.model_dump().items() if v is not None}
        if not update_data:
            return await self.get_feature_by_id(feature_id)

        update_data["updated_at"] = datetime.utcnow()

        result = await self.collection.find_one_and_update(
            {"_id": ObjectId(feature_id)},
            {"$set": update_data},
            return_document=True
        )
        if result:
            result["id"] = str(result.pop("_id"))
            return FeatureResponse(**result)
        return None

    async def delete_feature(self, feature_id: str) -> bool:
        result = await self.collection.delete_one({"_id": ObjectId(feature_id)})
        return result.deleted_count > 0

    async def get_active_features(self, app_id: str) -> list[FeatureResponse]:
        now = datetime.utcnow()
        query = {
            "app_id": app_id,
            "enabled": True,
            "$or": [
                {"start_date": None},
                {"start_date": {"$lte": now}}
            ]
        }
        features = []
        async for doc in self.collection.find(query):
            # Check end_date
            if doc.get("end_date") and doc["end_date"] < now:
                continue
            doc["id"] = str(doc.pop("_id"))
            features.append(FeatureResponse(**doc))
        return features

    def is_user_in_rollout(self, user_id: str, percentage: int) -> bool:
        """Consistent hashing for percentage rollout."""
        if percentage >= 100:
            return True
        if percentage <= 0:
            return False
        hash_value = int(hashlib.md5(user_id.encode()).hexdigest(), 16)
        return (hash_value % 100) < percentage

    async def evaluate_features(
        self, app_id: str, user_id: str, feature_keys: Optional[list[str]] = None
    ) -> dict[str, bool]:
        now = datetime.utcnow()
        query: dict = {"app_id": app_id, "enabled": True}
        if feature_keys:
            query["key"] = {"$in": feature_keys}

        result = {}
        async for doc in self.collection.find(query):
            key = doc["key"]

            # Check date constraints
            if doc.get("start_date") and doc["start_date"] > now:
                result[key] = False
                continue
            if doc.get("end_date") and doc["end_date"] < now:
                result[key] = False
                continue

            # Check rollout percentage
            percentage = doc.get("rollout_percentage", 100)
            result[key] = self.is_user_in_rollout(user_id, percentage)

        # Add requested but disabled features as False
        if feature_keys:
            for key in feature_keys:
                if key not in result:
                    result[key] = False

        return result
