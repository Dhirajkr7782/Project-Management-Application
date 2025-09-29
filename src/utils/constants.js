// Roles available in the system

export const UserRolesEnum = {
    ADMIN: "admin",
    PROJECT_MANAGER: "PROJECT_MANAGER",
    MEMBER: "member"

}
// Convert role values into an array → ["admin", "PROJECT_MANAGER", "member"]
export const AvailableUserRole = Object.values(UserRolesEnum);


export const TaskStatusEnum = {
  TODO: "todo",
  IN_PROGRESS: "in_progress",
  DONE: "done"
};

// Convert task statuses into an array → ["todo", "in_progress", "done"]
export const AvailableTaskStatus = Object.values(TaskStatusEnum);


