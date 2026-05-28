import {
	Schema,
	model,
	type Model,
	type HydratedDocument,
} from "mongoose";

export interface User {
	name: string;
	email: string;
	passwordHash: string;
	schoolName: string;
	city: string;
	avatarId: string;
	createdAt?: Date;
	updatedAt?: Date;
}

export type UserDocument = HydratedDocument<User>;

const userSchema = new Schema<User>(
	{
		name: { type: String, required: true },
		email: { type: String, required: true, unique: true, lowercase: true },
		passwordHash: { type: String, required: true },
		schoolName: { type: String, required: true },
		city: { type: String, required: true },
		avatarId: { type: String, default: "avatar_01" },
	},
	{ timestamps: true }
);

export const UserModel: Model<User> = model<User>("User", userSchema);
