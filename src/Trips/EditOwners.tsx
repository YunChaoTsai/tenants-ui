import React from "react"
import { Formik, Form } from "formik"
import { Button } from "@tourepedia/ui"
import { SelectUsers, store as userStore } from "./../Users"
import { useXHR } from "../xhr"
import { FormikFormGroup } from "../Shared/InputField"

export interface EditOwnersProps {
  users?: Array<userStore.IUser>
  type: "sales_team" | "operations_team"
  itemId: number
  onCancel: () => void
  onSuccess: () => void
}

export default function EditOwners({
  type,
  itemId,
  users = [],
  onCancel,
  onSuccess,
}: EditOwnersProps) {
  const xhr = useXHR()
  return (
    <Formik
      initialValues={{ items: [itemId], users }}
      onSubmit={(values, actions) => {
        actions.setStatus()
        xhr
          .put("/trip-owners", {
            items: values.items,
            users: values.users.map(u => u.id),
            type,
          })
          .then(() => {
            actions.setSubmitting(false)
            onSuccess()
          })
          .catch(e => {
            actions.setStatus(e.message)
            if (e.formikErrors) {
              actions.setErrors(e.formikErrors)
            }
            actions.setSubmitting(false)
          })
      }}
      render={({ setFieldValue, isSubmitting, status }) => (
        <Form noValidate>
          <fieldset>
            <legend>Edit Owners</legend>
            {status ? <p className="error-message">{status}</p> : null}
            <FormikFormGroup
              name="users"
              render={({ field }) => (
                <SelectUsers
                  {...field}
                  label="Select User(s)"
                  onChange={(value, name) => {
                    setFieldValue(name, value)
                  }}
                />
              )}
            />
            <footer>
              <Button type="submit" primary disabled={isSubmitting}>
                Save
              </Button>
              <Button
                disabled={isSubmitting}
                onClick={() => {
                  onCancel()
                }}
              >
                Cancel
              </Button>
            </footer>
          </fieldset>
        </Form>
      )}
    />
  )
}
