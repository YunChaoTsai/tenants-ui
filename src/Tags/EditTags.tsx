import React from "react"
import { Formik, Form } from "formik"
import { Button } from "@tourepedia/ui"
import { SelectTags, XHR } from "./List"
import { ITag } from "./store"
import { withXHR, XHRProps } from "../xhr"
import { FormikFormGroup } from "../Shared/InputField"

export interface EditTagsProps {
  tags?: Array<ITag>
  type: "trip"
  itemId: number
  onCancel: () => void
  onSuccess: () => void
}

export default withXHR(function EditTags({
  type,
  itemId,
  xhr,
  tags = [],
  onCancel,
  onSuccess,
}: XHRProps & EditTagsProps) {
  return (
    <Formik
      initialValues={{ items: [itemId], tags }}
      onSubmit={(values, actions) => {
        actions.setStatus()
        XHR(xhr, type)
          .storeTags(values.items, values.tags.map(t => t.name))
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
            <legend>Edit Tags</legend>
            {status ? <p className="error-message">{status}</p> : null}
            <FormikFormGroup
              name="tags"
              render={({ field }) => (
                <SelectTags
                  {...field}
                  label="Select existing or create new tags"
                  type={type}
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
})
