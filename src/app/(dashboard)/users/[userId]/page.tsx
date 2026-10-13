import {
  notFound,
} from "next/navigation";

import {
  AddUserForm,
} from "@/components/admin/add-user/add-user-form";

import {
  UserDetail,
} from "@/components/admin/user-detail/user-detail";

import {
  mapAdminUserDetail,
} from "@/components/admin/user-detail/user-detail-data";

import {
  getAdminUserActivityServer,
  getAdminUserDetailServer,
} from "@/lib/api/admin-users-server-api";

interface AdminUserPageProps {
  params: Promise<{
    userId: string;
  }>;

  searchParams: Promise<{
    edit?: string;
  }>;
}

export default async function AdminUserPage({
  params,
  searchParams,
}: AdminUserPageProps) {
  const {
    userId,
  } = await params;

  const {
    edit,
  } = await searchParams;

  try {
    const [
      detailResponse,
      activityResponse,
    ] =
      await Promise.all([
        getAdminUserDetailServer(
          userId,
        ),

        getAdminUserActivityServer(
          userId,
        ),
      ]);

    const backendUser =
      detailResponse.data?.user;

    if (!backendUser) {
      notFound();
    }

    const activities =
      activityResponse.data
        ?.activities ??
      [];

    if (
      edit === "true"
    ) {
      const role =
        backendUser.roles.includes(
          "SELLER",
        )
          ? "Supplier"
          : "Buyer";

      const fullName =
        backendUser.name?.trim() ||
        [
          backendUser.first_name,
          backendUser.last_name,
        ]
          .filter(Boolean)
          .join(" ")
          .trim();

      return (
        <AddUserForm
          mode="edit"
          userId={String(backendUser.user_id)}
          initialValues={{
            name:
              fullName ||
              "",

            mobile:
              backendUser.phone_number,

            role,
          }}
        />
      );
    }

    const user =
      mapAdminUserDetail(
        backendUser,
        activities,
      );

    return (
      <UserDetail
        user={user}
      />
    );
  } catch (error) {
    console.error(
      "Admin user detail error:",
      error,
    );

    notFound();
  }
}