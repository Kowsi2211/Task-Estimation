# Copyright (c) 2025, kowsalya and contributors
# For license information, please see license.txt

import frappe
from frappe.model.document import Document


class EstimationForm(Document):
	def on_update(doc):
		if doc.workflow_state == "Approved" and doc.customer_email:
			# Check if default outgoing email is configured
			if frappe.db.get_value("Email Account", {"default_outgoing": 1}):
				frappe.sendmail(
					recipients=[doc.customer_email],
					subject="Quotation Approved",
					message=f"""<p>Dear {doc.customer_name or "Valued Customer"},</p>
						<p>We are pleased to inform you that your quotation <strong>{doc.name}</strong> has been approved.</p>
						<p><strong>Project Title:</strong> {doc.project_name}<br>
						<strong>Total Amount:</strong> {doc.total_estimated_amount}<br>
						<p>If you have any questions, please feel free to contact us.</p>
						<p>Thank You<br>""",
					reference_doctype=doc.doctype,
					reference_name=doc.name
				)
			else:
				frappe.msgprint(
					"Cannot send email: Default Outgoing Email Account is not set. Please configure it in <strong>Setup > Email > Email Account</strong>.",
					alert=True,
					indicator="red"
				)
@frappe.whitelist()
def fetch_address(cust_name):
	link = frappe.db.get_value("Dynamic Link",{"link_title":cust_name,"link_doctype":"Customer"},"parent")
	
	if link:
		address = frappe.get_doc("Address",link)
		value = f"{address.address_line1}\n {address.city}\n{address.country}"
		email = address.email_id or 0
	else:
		value = 0
		email = 0
	return value,email