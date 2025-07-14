# Copyright (c) 2025, kowsalya and contributors
# For license information, please see license.txt

import frappe
from frappe.model.document import Document


class EstimationForm(Document):
	pass

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