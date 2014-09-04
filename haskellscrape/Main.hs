{-# LANGUAGE ScopedTypeVariables #-}
module Main where

import Data.List
import Data.Text.Encoding
import qualified Data.Text as T
import qualified Data.ByteString as BS
import Network.HTTP
import Control.Monad
import Text.HTML.TagSoup

data Hole = Hole
hole :: Hole
hole = undefined

-- | Avaa urlin ja kaivaa vastauksesta sisällön.
openUrl :: String -> IO String
openUrl url = simpleHTTP (getRequest url) >>= getResponseBody


-- | Kerää nettisivulta kaikki linkit, joiden href alkaa
--   merkkijonolla "tuotteet".
scrapeCategoryLinkHrefs :: String -- ^ Kategoriasivun URL
                        -> IO [String]
scrapeCategoryLinkHrefs = liftM (map getHref . filter productLink) . fmap parseTags . openUrl
    where
        -- Ottaa tagista hrefin arvon talteen
        getHref :: Tag String -> String
        getHref tag
            | isTagOpen tag = fromAttrib "href" tag
            | otherwise     = ""

        -- Palauttaa True, jos tagi on linkki, ja sen hrefin alussa on "tuotteet"
        productLink :: Tag String -> Bool
        productLink (TagOpen "a" attr) = any (\(_, v) -> "tuotteet" `isPrefixOf` v) attr
        productLink _                  = False


-- | Kerää tuotesivulta tuotteiden nimet.
scrapeProductNames :: String -- ^ Tuotesivun URL
                   -> IO [String]
scrapeProductNames productPageUrl = do
    putStrLn $ "Scraping " ++ productPageUrl
    tags <- fmap parseTags $ openUrl productPageUrl
    let productTags = sections (~== "<div class=product-text>") tags
    return $ map (fromTagText . flip (!!) 3) productTags


-- | Kerää tuotteet scrape.txt tiedostoon.
main :: IO ()
main = do
    categoryUrls <- (fmap . map) (baseUrl ++) (scrapeCategoryLinkHrefs testUrl)
    productNames <- fmap concat $ mapM scrapeProductNames categoryUrls
    BS.writeFile "scrape.txt" . encodeUtf8 . T.pack $ intercalate "\n" productNames
    where
        testUrl =  "http://www.rainbow.fi/rainbow-tuotteet/selaa-tuotteita/"
        baseUrl = "http://www.rainbow.fi/"
