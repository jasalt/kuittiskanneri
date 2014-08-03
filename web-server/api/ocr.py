def optical_character_recognition(imagepath):
    """ Does OCR on an image and returns tuple:
        (raw text, autocorrected text, parsed receipt data) """

    # Process image with ImageMagick
    tempimagepath = os.path.join(app.config['UPLOAD_FOLDER'], 'temp.png')
    im_proc = subprocess.Popen(['convert',imagepath,'-resize','600x800',
                                '-blur','2','-lat','8x8-2%',tempimagepath],
                                stdout=subprocess.PIPE)
    im_proc.communicate()

    image_text = ""
    proc = subprocess.Popen([OCR_SCRIPT, tempimagepath],
                            stdout=subprocess.PIPE)
    for line in iter(proc.stdout.readline, ''):
        image_text += line.rstrip() + '\n'

    image_text = image_text.decode('utf-8')

    corrected_text = autocorrect.correct_text_block(image_text)

    if corrected_text is unicode:
        corrected_text = corrected_text.encode('utf-8')

    return (image_text,
            corrected_text,
            receiptparser.parse_receipt(corrected_text))
