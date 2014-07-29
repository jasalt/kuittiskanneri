import codecs
import difflib

WORDS = None

def init(wordlist_filename):
    """ Initializes the autocorrect module. """
    global WORDS
    if WORDS == None:
        WORDS = []
        bad_line = lambda x: x.strip() == '' or x.startswith('#')
        with codecs.open(wordlist_filename, 'r', 'utf-8') as filehandle:
            lines = filehandle.readlines()
            WORDS = set([x.lower().strip() for x in lines if not bad_line(x)])


def correct_word(word, cutoff):
    """ Autocorrects a word by using a pre-defined word list. """
    if WORDS is not None:
        result = difflib.get_close_matches(word, WORDS, n=1, cutoff=cutoff)
        print result
        if len(result) > 0:
            return result[0]

    return word


def correct_text_block(txt, cutoff=0.65):
    def __correct_line__(line):
        words = [correct_word(word.lower(), cutoff) for word in line.split(' ')]
        return u' '.join(words)
    
    return '\n'.join([__correct_line__(line) for line in txt.splitlines()])


if __name__ == '__main__':
    init('wordlist.txt')
    with codecs.open('test.txt', 'r', 'utf-8') as f:
        testdata = f.read()

    c = correct_text_block(testdata)
    print '-' * 78
    print c