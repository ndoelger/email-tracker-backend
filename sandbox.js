const array = ["crm.objects.contacts.write", "sales-email-read"];
console.log(array.split(/ |, ?|%20/).join(" "));
