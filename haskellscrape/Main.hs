{-# LANGUAGE ScopedTypeVariables #-}
module Main where

import Data.List
import qualified Data.ByteString.Char8 as BS
import qualified Data.ByteString.UTF8 as UTF
import Network.HTTP
import Control.Monad
import Text.HTML.TagSoup


-- | Avaa urlin ja kaivaa vastauksesta sisällön.
openUrl :: String -> IO String
openUrl url = liftM (UTF.toString . BS.pack) $ simpleHTTP (getRequest url) >>= getResponseBody


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
    productNames <- fmap concat $ mapM scrapeProductNames (take 3 categoryUrls)
    BS.writeFile "scrape.txt" . UTF.fromString $ intercalate "\n" productNames
    where
        testUrl =  "http://www.rainbow.fi/rainbow-tuotteet/selaa-tuotteita/"
        baseUrl = "http://www.rainbow.fi/"
