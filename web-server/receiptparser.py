# -*- coding: utf-8 -*-
import unittest

testtext = u"""
k-supermarket länsiväylä
puh. 01042 33900
4 k4 m000004/1939 21:01 28-05-2014

sallinen maapähkinä lkg 4.40
valio rasvaton maito 1,51 1.55
elonen ruisevas 540g 9kpl 1.59
pirkka banaani 0.75
es tonnikalahiutale 185/1409 vedessä 0.79
pirkka maksamakkara 300g 1.00
yhteensä 10.08
korttitapahtuma
kortti visa electron
*mu: *n* *m* 7956 cp
sovellus la us: a000oo00032010
tap.nro/varmennus 00942/151372
yritys/ala 020327326100/5411
autbnt1901ntli cf70d1e6903fcb8a
visa he: 1405223010942
debit/veloitus 10,03 eur
alv veroton vero verollinen
2 14.00% 8.84 1.24 10.08

yhteensä 8.84 1.24 10.08"""


def parse_float(txt):
    """ Returns None or parsed float value. """
    # Floats must have decimal point
    if txt.find('.') == -1:
        return None

    # Parse float using python's built-in converter
    try:
        return float(txt)
    except ValueError:
        return None


def parse_product_line(txt):
    """ Returns None or {name, price}
    Example: { name:'pirkka banaani', price: 0.75 }
    """
    invalid_starts = ['yhtee', 'k-plussa', 'plussaa']
    words = txt.split(' ')
    if len(words) >= 2:
        # Lines starting with any of invalid_starts are not products
        if not any([words[0].startswith(s) for s in invalid_starts]):
            # Price is the last word of the line
            price = parse_float(words[-1])
            if price is not None:
                product_name = ' '.join(words[0:-1])
                # Calculate percentage of digits in product_name
                number_acc = lambda acc, c: acc + (1 if c.isdigit() else 0)
                characters = float(len(product_name))
                digit_percent = reduce(number_acc, product_name, 0) / characters
                # Names with over 50% digits are not product names
                if digit_percent > 0.5:
                    return None
                return { 'name': product_name, 'price': price }
    return None


def parse_sum(txt):
    """ Returns None or total sum as float (if possible) or as string. """
    words = txt.split(' ')
    if len(words) >= 2:
        if words[0].startswith('yhtee'):
            # Try float parsing
            total_sum = parse_float(words[-1])
            if total_sum is None:
                total_sum = words[-1]
            return total_sum


def preprocess(txt):
    """ Removes empty lines and unnecessary whitespace. """
    return [line.strip() for line in txt.splitlines() if line.strip() != ""]


def parse_receipt(txt):
    """ Parses receipt and returns parsed data. """
    result = { 'products': [], 'total_sum': 0.0 }
    for line in preprocess(txt):
        parsed_product = parse_product_line(line)
        if parsed_product is not None:
            result['products'].append(parsed_product)

        parsed_sum = parse_sum(line)
        if parsed_sum is not None:
            result['total_sum'] = parsed_sum

    return result


class ParserTest(unittest.TestCase):
    """ Tests all receipt parser functions. """

    def test_float(self):
        """ Tests parse_float """
        test = lambda inp, expected:\
            self.assertEqual(parse_float(inp), expected)
        # Valid floats
        test('0.00', 0.0)
        test('13.75', 13.75)
        test(u'0.05', 0.05)
        # Invalid floats
        test('', None)
        test(' ', None)
        test('abc', None)
        

    def test_product_line(self):
        """ Tests parse_product_line """
        test = lambda inp, expected:\
            self.assertEqual(parse_product_line(inp), expected)
        # Valid product lines
        test('valio rasvaton maito 1,5l 1.55', \
            {'name': 'valio rasvaton maito 1,5l', 'price': 1.55})
        test('pirkka maksamakkara 300g 1.00', \
            {'name': 'pirkka maksamakkara 300g', 'price': 1.00})
        test(u'sallinen maapähkinä 1kg 4.40', \
            {'name': u'sallinen maapähkinä 1kg', 'price': 4.4})
        # Invalid product lines
        test('4 k4 m000004/1939 21:01 28-05-2014', None)
        test('yhteensä 8.84 1.24 10.08', None)
        test('puh. 01042 33900', None)
        test(u'korttitapahtuma', None)
        test("2 14.0q% 9.95 1.39 11.34", None)

    def test_sum(self):
        """ Tests parse_sum """
        test = lambda inp, expected:\
            self.assertEqual(parse_sum(inp), expected)
        # Valid sums
        test(u'yhteensä 15.62', 15.62)
        test(u'yhteensä 6i.00', u'6i.00')
        # Invalid sums


if __name__ == '__main__':
    unittest.main()