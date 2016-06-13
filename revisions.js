string_a = "The quick";
string_b = "The quick brown fox jumps over the lazy dog."
first_occurance = string_b.indexOf(string_a);
if (first_occurance == -1) {
  alert('Search string Not found')
} else {
  string_a_length = string_a.length;
  if (first_occurance == 0) {
    new_string = string_b.substring(string_a_length);
  } else {
    new_string = string_b.substring(0, first_occurance);
    new_string += string_b.substring(first_occurance + string_a_length);
  }
  alert(new_string);
}
