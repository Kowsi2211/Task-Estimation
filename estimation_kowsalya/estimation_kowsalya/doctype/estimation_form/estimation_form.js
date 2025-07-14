// Copyright (c) 2025, kowsalya and contributors
// For license information, please see license.txt

frappe.ui.form.on("Estimation Form", {
	refresh(frm) {
		if (frm.doc.workflow_state == "Final Approve") {
			let today = frappe.datetime.now_date();
			frm.set_value("approved_on", today);
			frm.refresh_field("approved_on");
			frm.save()
		}
		if (frm.doc.customer_name) {
			frappe.call({
				method: "estimation_kowsalya.estimation_kowsalya.doctype.estimation_form.estimation_form.fetch_address",
				args: {
					cust_name: frm.doc.customer_name,
				},
				callback: function (r) {
					let [address, email] = r.message;

					if (address) {
						frm.set_df_property("customer_address", "read_only", 1);
					} else {
						frm.set_df_property("customer_address", "read_only", 0);
					}
					if (email) {
						frm.set_df_property("customer_email", "read_only", 1);
					} else {
						frm.set_df_property("customer_email", "read_only", 0);
					}
				},
			});
		} else {
			frm.set_value("customer_email", " ");
			frm.set_value("customer_address", " ");
		}
		

		setTimeout(() => {
			// Hide all buttons or links that say "Edit"
			$("a.dropdown-item:contains('Edit'), button.dropdown-item:contains('Edit')").hide();
		}, 500);
	},
	customer(frm) {
		if (frm.doc.customer_name) {
			
			frappe.call({
				method: "estimation_kowsalya.estimation_kowsalya.doctype.estimation_form.estimation_form.fetch_address",
				args: { cust_name: frm.doc.customer_name },
				callback: function (r) {
					let [address, email] = r.message;
					if (address) {
						frm.set_value("customer_address", address);
						frm.set_df_property("customer_address", "read_only", 1);
					} else {
						frm.set_value("customer_address", " ");
						frm.set_df_property("customer_address", "read_only", 0);
					}
					if (email) {
						frm.set_value("customer_email", email);
						frm.set_df_property("customer_email", "read_only", 1);
					} else {
						frm.set_value("customer_email", " ");
						frm.set_df_property("customer_email", "read_only", 0);
					}
				},
			});
		}
		else{
			frm.set_value("customer_address","")
			frm.set_value("customer_email","")
		}
	},
	before_workflow_action: function (frm) {
		var action = frm.selected_workflow_action;
		if (action && action.toLowerCase() === "submit") {
			frappe.validated = false;
			let d = new frappe.ui.Dialog({
				title: "Enter details",
				fields: [
					{
						label: __("Customer Name"),
						fieldname: "customer_name",
						fieldtype: "Data",
						default: frm.doc.customer_name,
						read_only: 1,
					},
					{
						label: __("Project ID"),
						fieldname: "project_id",
						fieldtype: "Data",
						default: frm.doc.project_id,
						read_only: 1,
					},
					{
						label: __("Project Name"),
						fieldname: "project_name",
						fieldtype: "Data",
						default: frm.doc.project_name,
						read_only: 1,
					},
					{
						label: __("Total No of Employees"),
						fieldname: "total_no_of_employees",
						fieldtype: "Data",
						default: frm.doc.total_no_of_employees,
						read_only: 1,
					},
					{
						label: __("Total Estimated Amount"),
						fieldname: "total_estimated_amount",
						fieldtype: "Data",
						default: frm.doc.total_estimated_amount,
					},
				],
				primary_action_label: "Confirm ",
				primary_action(values) {
					frm.set_value("total_estimated_amount", values.total_estimated_amount);
					frm.save()
					d.hide();
				},
				secondary_action_label: "Edit ",
				secondary_action() {
					frm.set_value("workflow_state", "Draft");
					frm.set_value("status", "Draft");
					frm.save();

					d.hide();
				},
			});
			d.show();
			return false;
		}
	},
});
frappe.ui.form.on("Estimation Table", {
	length(frm, cdn, cdt) {
		calculate_estimation_amount(frm, cdn, cdt);
		total(frm, cdn, cdt);
	},
	width(frm, cdn, cdt) {
		calculate_estimation_amount(frm, cdn, cdt);
		total(frm, cdn, cdt);
	},
	no_of_employees(frm, cdn, cdt) {
		calculate_estimation_amount(frm, cdn, cdt);
		total(frm, cdn, cdt);
	},
	rate(frm, cdn, cdt) {
		calculate_estimation_amount(frm, cdn, cdt);
		total(frm, cdn, cdt);
	},
	estimation_table_add(frm, cdn, cdt) {
		total(frm, cdn, cdt);
	},
	estimation_table_remove(frm, cdn, cdt) {
		total(frm, cdn, cdt);
	},
});
function calculate_estimation_amount(frm, cdn, cdt) {
	let row = locals[cdn][cdt];
	if (row.length && row.width && row.no_of_employees && row.rate) {
		let est_amt = 0;
		frm.doc.estimation_table.forEach((r) => {
			est_amt = ((r.length * r.width) / r.no_of_employees) * r.rate;
		});
		console.log(est_amt);
		frappe.model.set_value(cdn, cdt, "estimation_amount", est_amt);
	}
}
function total(frm, cdn, cdt) {
	let total_emp = 0;
	let total_est_amt = 0;
	let row = locals[cdn][cdt];
	frm.doc.estimation_table.forEach((r) => {
		total_emp += r.no_of_employees || 0;
		total_est_amt += r.estimation_amount || 0;
	});

	frm.set_value("total_no_of_employees", total_emp);
	frm.set_value("total_estimated_amount", total_est_amt);
}
